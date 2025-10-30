-- Fix profile ID mismatch with auth user IDs
-- This migration aligns profiles.id with auth.users.id based on employee_id

-- Step 1: Add temporary tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS old_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Step 2: Map auth users to profiles based on employee_id in metadata
UPDATE profiles p
SET auth_user_id = au.id
FROM auth.users au
WHERE au.raw_user_meta_data->>'employee_id' = p.employee_id;

-- Step 3: Store old profile IDs for reference
UPDATE profiles SET old_id = id WHERE auth_user_id IS NOT NULL;

-- Step 4: Create temporary mapping table for cascading updates
CREATE TEMP TABLE id_mapping AS
SELECT old_id, auth_user_id as new_id
FROM profiles
WHERE auth_user_id IS NOT NULL;

-- Step 5: Update user_roles to use new IDs
UPDATE user_roles ur
SET user_id = m.new_id
FROM id_mapping m
WHERE ur.user_id = m.old_id;

-- Step 6: Update ot_requests employee_id references
UPDATE ot_requests otr
SET employee_id = m.new_id
FROM id_mapping m
WHERE otr.employee_id = m.old_id;

-- Step 7: Update ot_requests supervisor_id references
UPDATE ot_requests otr
SET supervisor_id = m.new_id
FROM id_mapping m
WHERE otr.supervisor_id = m.old_id;

-- Step 8: Update ot_requests hr_id references
UPDATE ot_requests otr
SET hr_id = m.new_id
FROM id_mapping m
WHERE otr.hr_id = m.old_id;

-- Step 9: Update profiles supervisor_id references
UPDATE profiles p
SET supervisor_id = m.new_id
FROM id_mapping m
WHERE p.supervisor_id = m.old_id;

-- Step 10: Update profiles.id to match auth_user_id
UPDATE profiles
SET id = auth_user_id
WHERE auth_user_id IS NOT NULL;

-- Step 11: Clean up temporary columns
ALTER TABLE profiles DROP COLUMN IF EXISTS old_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS auth_user_id;