-- Update verify_employee_credentials to allow login for pending_activation users who must change password
CREATE OR REPLACE FUNCTION public.verify_employee_credentials(_employee_id text, _password text)
 RETURNS TABLE(success boolean, user_id uuid, employee_id text, full_name text, must_change_password boolean, roles app_role[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_password_hash TEXT;
  v_user_id UUID;
  v_full_name TEXT;
  v_must_change BOOLEAN;
  v_is_active BOOLEAN;
  v_profile_status TEXT;
  v_roles app_role[];
BEGIN
  -- Get credentials and profile info
  SELECT 
    ac.password_hash,
    ac.is_active,
    ac.must_change_password,
    p.id,
    p.full_name,
    p.status
  INTO 
    v_password_hash,
    v_is_active,
    v_must_change,
    v_user_id,
    v_full_name,
    v_profile_status
  FROM auth_user_credentials ac
  JOIN profiles p ON p.employee_id = ac.employee_id
  WHERE ac.employee_id = _employee_id;
  
  -- Check if employee exists
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, ARRAY[]::app_role[];
    RETURN;
  END IF;
  
  -- Check if credentials are active
  IF NOT v_is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, ARRAY[]::app_role[];
    RETURN;
  END IF;
  
  -- Block inactive profiles completely
  IF v_profile_status = 'inactive' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, ARRAY[]::app_role[];
    RETURN;
  END IF;
  
  -- Allow pending_activation ONLY if must_change_password is true
  IF v_profile_status = 'pending_activation' AND NOT v_must_change THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, ARRAY[]::app_role[];
    RETURN;
  END IF;
  
  -- For any other status (not active, not pending_activation), block login
  IF v_profile_status != 'active' AND v_profile_status != 'pending_activation' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, ARRAY[]::app_role[];
    RETURN;
  END IF;
  
  -- Verify password using pgcrypto crypt function
  IF v_password_hash != crypt(_password, v_password_hash) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, false, ARRAY[]::app_role[];
    RETURN;
  END IF;
  
  -- Get user roles
  SELECT ARRAY_AGG(role)
  INTO v_roles
  FROM user_roles
  WHERE user_id = v_user_id;
  
  -- Success
  RETURN QUERY SELECT 
    true, 
    v_user_id, 
    _employee_id, 
    v_full_name, 
    v_must_change,
    COALESCE(v_roles, ARRAY[]::app_role[]);
END;
$function$;