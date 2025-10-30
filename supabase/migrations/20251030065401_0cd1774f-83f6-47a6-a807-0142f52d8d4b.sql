-- Fix ambiguous employee_id parameter in check_ot_eligibility function
CREATE OR REPLACE FUNCTION public.check_ot_eligibility(employee_id uuid, ot_date date)
RETURNS TABLE(is_eligible boolean, rule_id uuid, rule_name text, reason text)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  emp_record RECORD;
  rule_record RECORD;
  global_threshold NUMERIC;
BEGIN
  -- Get employee details (qualify parameter to avoid ambiguity)
  SELECT 
    p.basic_salary,
    p.department_id,
    p.employment_type,
    p.supervisor_id,
    p.status
  INTO emp_record
  FROM public.profiles p
  WHERE p.id = check_ot_eligibility.employee_id;
  
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
$function$;