-- Fix ambiguous employee_id column reference in check_threshold_violations function
CREATE OR REPLACE FUNCTION public.check_threshold_violations(employee_id uuid, requested_hours numeric, requested_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
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
  
  -- Calculate existing OT hours for the day (qualified with table alias)
  SELECT COALESCE(SUM(ot.total_hours), 0)
  INTO daily_hours
  FROM public.ot_requests ot
  WHERE ot.employee_id = check_threshold_violations.employee_id
    AND ot.ot_date = requested_date
    AND ot.status NOT IN ('rejected');
  
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
  
  -- Calculate weekly hours (qualified with table alias)
  SELECT COALESCE(SUM(ot.total_hours), 0)
  INTO weekly_hours
  FROM public.ot_requests ot
  WHERE ot.employee_id = check_threshold_violations.employee_id
    AND ot.ot_date >= date_trunc('week', requested_date)
    AND ot.ot_date < date_trunc('week', requested_date) + INTERVAL '1 week'
    AND ot.status NOT IN ('rejected');
  
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
  
  -- Calculate monthly hours (qualified with table alias)
  SELECT COALESCE(SUM(ot.total_hours), 0)
  INTO monthly_hours
  FROM public.ot_requests ot
  WHERE ot.employee_id = check_threshold_violations.employee_id
    AND ot.ot_date >= date_trunc('month', requested_date)
    AND ot.ot_date < date_trunc('month', requested_date) + INTERVAL '1 month'
    AND ot.status NOT IN ('rejected');
  
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
$function$;