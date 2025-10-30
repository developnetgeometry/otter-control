-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create auth_user_credentials table
CREATE TABLE public.auth_user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL REFERENCES profiles(employee_id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  last_password_change TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_user_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own credentials"
  ON auth_user_credentials FOR SELECT
  USING (employee_id IN (
    SELECT employee_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own credentials"
  ON auth_user_credentials FOR UPDATE
  USING (employee_id IN (
    SELECT employee_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins and HR can manage all credentials"
  ON auth_user_credentials FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role));

-- Trigger to update updated_at
CREATE TRIGGER update_auth_credentials_timestamp
BEFORE UPDATE ON auth_user_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to verify employee credentials
CREATE OR REPLACE FUNCTION verify_employee_credentials(
  _employee_id TEXT,
  _password TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  employee_id TEXT,
  full_name TEXT,
  must_change_password BOOLEAN,
  roles app_role[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Check if account is active
  IF NOT v_is_active OR v_profile_status != 'active' THEN
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
$$;