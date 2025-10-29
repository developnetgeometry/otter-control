-- Fix Function Search Path Security Issues
-- This migration adds SET search_path = public to all functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix determine_day_type function
CREATE OR REPLACE FUNCTION public.determine_day_type(ot_date DATE)
RETURNS public.day_type
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  day_of_week INTEGER;
  is_holiday BOOLEAN;
BEGIN
  -- Check if it's a public holiday
  SELECT EXISTS (
    SELECT 1 FROM public.public_holidays WHERE holiday_date = ot_date
  ) INTO is_holiday;
  
  IF is_holiday THEN
    RETURN 'public_holiday'::public.day_type;
  END IF;
  
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM ot_date);
  
  IF day_of_week = 0 THEN
    RETURN 'sunday'::public.day_type;
  ELSIF day_of_week = 6 THEN
    RETURN 'saturday'::public.day_type;
  ELSE
    RETURN 'weekday'::public.day_type;
  END IF;
END;
$$;

-- Fix calculate_ot_amount function
CREATE OR REPLACE FUNCTION public.calculate_ot_amount(
  basic_salary NUMERIC,
  total_hours NUMERIC,
  day_type public.day_type
)
RETURNS TABLE(orp NUMERIC, hrp NUMERIC, ot_amount NUMERIC)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  calc_orp NUMERIC;
  calc_hrp NUMERIC;
  calc_amount NUMERIC;
BEGIN
  -- Calculate ORP and HRP
  calc_orp := basic_salary / 26;
  calc_hrp := calc_orp / 8;
  
  -- Calculate OT amount based on day type
  CASE day_type
    WHEN 'weekday' THEN
      calc_amount := 1.5 * calc_hrp * total_hours;
    
    WHEN 'saturday' THEN
      calc_amount := 2 * calc_hrp * total_hours;
    
    WHEN 'sunday' THEN
      IF total_hours <= 4 THEN
        calc_amount := 0.5 * calc_orp;
      ELSIF total_hours <= 8 THEN
        calc_amount := 1 * calc_orp;
      ELSE
        calc_amount := (1 * calc_orp) + (2 * calc_hrp * (total_hours - 8));
      END IF;
    
    WHEN 'public_holiday' THEN
      IF total_hours <= 8 THEN
        calc_amount := 2 * calc_orp;
      ELSE
        calc_amount := (2 * calc_orp) + (3 * calc_hrp * (total_hours - 8));
      END IF;
  END CASE;
  
  RETURN QUERY SELECT 
    ROUND(calc_orp, 2),
    ROUND(calc_hrp, 2),
    ROUND(calc_amount, 2);
END;
$$;

-- Fix check_ot_eligibility function
CREATE OR REPLACE FUNCTION public.check_ot_eligibility(
  employee_id UUID,
  ot_date DATE
)
RETURNS TABLE(
  is_eligible BOOLEAN,
  rule_id UUID,
  rule_name TEXT,
  reason TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  emp_record RECORD;
  rule_record RECORD;
  global_threshold NUMERIC;
BEGIN
  -- Get employee details
  SELECT 
    p.basic_salary,
    p.department_id,
    p.employment_type,
    p.supervisor_id,
    p.status
  INTO emp_record
  FROM public.profiles p
  WHERE p.id = employee_id;
  
  -- Check if employee exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Employee not found';
    RETURN;
  END IF;
  
  -- Check if employee is active
  IF emp_record.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Employee account is not active';
    RETURN;
  END IF;
  
  -- Check if supervisor is assigned
  IF emp_record.supervisor_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'No supervisor assigned';
    RETURN;
  END IF;
  
  -- Get global salary threshold
  SELECT salary_threshold INTO global_threshold FROM public.ot_settings LIMIT 1;
  
  -- Check salary threshold
  IF emp_record.basic_salary >= COALESCE(global_threshold, 4000) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Basic salary exceeds eligibility threshold';
    RETURN;
  END IF;
  
  -- Find matching eligibility rule
  SELECT 
    r.id,
    r.rule_name
  INTO rule_record
  FROM public.ot_eligibility_rules r
  WHERE r.is_active = true
    AND emp_record.basic_salary >= r.min_salary
    AND emp_record.basic_salary <= r.max_salary
    AND (r.department_ids IS NULL OR emp_record.department_id = ANY(r.department_ids))
    AND (r.employment_types IS NULL OR emp_record.employment_type = ANY(r.employment_types))
  LIMIT 1;
  
  IF rule_record.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'No matching eligibility rule found';
    RETURN;
  END IF;
  
  -- Employee is eligible
  RETURN QUERY SELECT true, rule_record.id, rule_record.rule_name, 'Eligible for OT'::TEXT;
END;
$$;

-- Fix check_threshold_violations function
CREATE OR REPLACE FUNCTION public.check_threshold_violations(
  employee_id UUID,
  requested_hours NUMERIC,
  requested_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  emp_dept_id UUID;
  threshold_record RECORD;
  daily_hours NUMERIC;
  weekly_hours NUMERIC;
  monthly_hours NUMERIC;
  violations JSONB := '[]'::JSONB;
BEGIN
  -- Get employee department
  SELECT department_id INTO emp_dept_id FROM public.profiles WHERE id = employee_id;
  
  -- Get applicable threshold
  SELECT 
    daily_limit_hours,
    weekly_limit_hours,
    monthly_limit_hours,
    max_claimable_amount
  INTO threshold_record
  FROM public.ot_approval_thresholds
  WHERE is_active = true
    AND (applies_to_department_ids IS NULL OR emp_dept_id = ANY(applies_to_department_ids))
  LIMIT 1;
  
  -- If no threshold found, use defaults
  IF threshold_record IS NULL THEN
    SELECT 4, 20, 80, 1000 
    INTO threshold_record;
  END IF;
  
  -- Calculate existing OT hours for the day
  SELECT COALESCE(SUM(total_hours), 0)
  INTO daily_hours
  FROM public.ot_requests
  WHERE employee_id = check_threshold_violations.employee_id
    AND ot_date = requested_date
    AND status NOT IN ('rejected');
  
  -- Check daily limit
  IF (daily_hours + requested_hours) > threshold_record.daily_limit_hours THEN
    violations := violations || jsonb_build_object(
      'type', 'daily_limit',
      'limit', threshold_record.daily_limit_hours,
      'current', daily_hours,
      'requested', requested_hours,
      'total', daily_hours + requested_hours
    );
  END IF;
  
  -- Calculate weekly hours
  SELECT COALESCE(SUM(total_hours), 0)
  INTO weekly_hours
  FROM public.ot_requests
  WHERE employee_id = check_threshold_violations.employee_id
    AND ot_date >= date_trunc('week', requested_date)
    AND ot_date < date_trunc('week', requested_date) + INTERVAL '1 week'
    AND status NOT IN ('rejected');
  
  -- Check weekly limit
  IF (weekly_hours + requested_hours) > threshold_record.weekly_limit_hours THEN
    violations := violations || jsonb_build_object(
      'type', 'weekly_limit',
      'limit', threshold_record.weekly_limit_hours,
      'current', weekly_hours,
      'requested', requested_hours,
      'total', weekly_hours + requested_hours
    );
  END IF;
  
  -- Calculate monthly hours
  SELECT COALESCE(SUM(total_hours), 0)
  INTO monthly_hours
  FROM public.ot_requests
  WHERE employee_id = check_threshold_violations.employee_id
    AND ot_date >= date_trunc('month', requested_date)
    AND ot_date < date_trunc('month', requested_date) + INTERVAL '1 month'
    AND status NOT IN ('rejected');
  
  -- Check monthly limit
  IF (monthly_hours + requested_hours) > threshold_record.monthly_limit_hours THEN
    violations := violations || jsonb_build_object(
      'type', 'monthly_limit',
      'limit', threshold_record.monthly_limit_hours,
      'current', monthly_hours,
      'requested', requested_hours,
      'total', monthly_hours + requested_hours
    );
  END IF;
  
  RETURN jsonb_build_object('violations', violations);
END;
$$;

-- Fix get_active_formula function
CREATE OR REPLACE FUNCTION public.get_active_formula(
  day_type public.day_type,
  employee_category TEXT,
  ot_date DATE
)
RETURNS TABLE(
  formula_id UUID,
  multiplier NUMERIC,
  base_formula TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.multiplier,
    f.base_formula
  FROM public.ot_rate_formulas f
  WHERE f.is_active = true
    AND f.day_type = get_active_formula.day_type
    AND f.employee_category = get_active_formula.employee_category
    AND f.effective_from <= ot_date
    AND (f.effective_to IS NULL OR f.effective_to >= ot_date)
  ORDER BY f.created_at DESC
  LIMIT 1;
END;
$$;