-- Populate auth_user_credentials for all test users
-- This enables employee ID-based authentication for test accounts

DO $$
DECLARE
  v_salt TEXT;
BEGIN
  -- Generate salt for password hashing
  v_salt := extensions.gen_salt('bf');

  -- Insert credentials for EMP001 (Admin)
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP001', extensions.crypt('Admin123!', v_salt), false, true
  WHERE EXISTS (SELECT 1 FROM profiles WHERE employee_id = 'EMP001')
  ON CONFLICT (employee_id) DO NOTHING;

  -- Insert credentials for EMP002 (HR)
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP002', extensions.crypt('HR123!', v_salt), false, true
  WHERE EXISTS (SELECT 1 FROM profiles WHERE employee_id = 'EMP002')
  ON CONFLICT (employee_id) DO NOTHING;

  -- Insert credentials for EMP003 (BOD)
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP003', extensions.crypt('BOD123!', v_salt), false, true
  WHERE EXISTS (SELECT 1 FROM profiles WHERE employee_id = 'EMP003')
  ON CONFLICT (employee_id) DO NOTHING;

  -- Insert credentials for EMP004 (Supervisor)
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP004', extensions.crypt('Super123!', v_salt), false, true
  WHERE EXISTS (SELECT 1 FROM profiles WHERE employee_id = 'EMP004')
  ON CONFLICT (employee_id) DO NOTHING;

  -- Insert credentials for EMP005 (IT Staff)
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP005', extensions.crypt('Emp123!', v_salt), false, true
  WHERE EXISTS (SELECT 1 FROM profiles WHERE employee_id = 'EMP005')
  ON CONFLICT (employee_id) DO NOTHING;

  -- Insert credentials for EMP006 (Sales Staff)
  INSERT INTO auth_user_credentials (employee_id, password_hash, must_change_password, is_active)
  SELECT 'EMP006', extensions.crypt('Emp123!', v_salt), false, true
  WHERE EXISTS (SELECT 1 FROM profiles WHERE employee_id = 'EMP006')
  ON CONFLICT (employee_id) DO NOTHING;

END $$;