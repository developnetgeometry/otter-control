
-- Add missing credentials for existing employee EMP006
-- This is a one-time fix for employees created before the credential system

DO $$
DECLARE
  hashed_pw TEXT;
BEGIN
  -- Hash the default password 'Temp@1234'
  hashed_pw := crypt('Temp@1234', gen_salt('bf'));
  
  -- Insert credentials for EMP006 if they don't exist
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP006', hashed_pw, true, true
  WHERE NOT EXISTS (
    SELECT 1 FROM auth_user_credentials WHERE employee_id = 'EMP006'
  );
END $$;
