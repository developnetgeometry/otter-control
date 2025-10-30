-- Add unique constraint to employee_id to prevent duplicates
ALTER TABLE profiles ADD CONSTRAINT profiles_employee_id_unique UNIQUE (employee_id);