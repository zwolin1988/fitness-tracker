-- Migration: Create test auth users
-- Date: 2025-10-14
-- Description: Creates auth users that can be used for testing
-- IMPORTANT: This migration uses admin functions that may require special permissions

-- ===========================
-- INSTRUCTIONS:
-- ===========================
-- Since auth.users is managed by Supabase Auth, you have two options:
--
-- Option 1 (Recommended): Create users via Supabase Dashboard
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add user"
-- 3. Create admin user:
--    - Email: admin@fitness-tracker.local
--    - Password: Admin123!@#
--    - User UID: bfe54383-7eb6-4581-969e-49a2b4b750d6
-- 4. Create regular user:
--    - Email: user@fitness-tracker.local
--    - Password: User123!@#
--    - User UID: 65a9651d-d0d2-4b69-bbfa-9a09a239d9a9
--
-- Option 2: Use this SQL (requires admin privileges):
-- Run the code below if you have access to admin functions

-- ===========================
-- CREATE AUTH USERS (Option 2)
-- ===========================

-- Check if auth schema and functions exist
DO $$
BEGIN
  -- Try to create admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'bfe54383-7eb6-4581-969e-49a2b4b750d6') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'bfe54383-7eb6-4581-969e-49a2b4b750d6',
      'authenticated',
      'authenticated',
      'admin@fitness-tracker.local',
      crypt('Admin123!@#', gen_salt('bf')), -- Password: Admin123!@#
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Jan Kowalski (Admin)"}',
      false,
      '',
      '',
      '',
      ''
    );
    RAISE NOTICE 'Created admin user: admin@fitness-tracker.local';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;

  -- Try to create regular user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9',
      'authenticated',
      'authenticated',
      'user@fitness-tracker.local',
      crypt('User123!@#', gen_salt('bf')), -- Password: User123!@#
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Anna Nowak"}',
      false,
      '',
      '',
      '',
      ''
    );
    RAISE NOTICE 'Created regular user: user@fitness-tracker.local';
  ELSE
    RAISE NOTICE 'Regular user already exists';
  END IF;

EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create auth users directly.';
    RAISE NOTICE 'Please create users manually via Supabase Dashboard (see instructions above).';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating auth users: %', SQLERRM;
    RAISE NOTICE 'Please create users manually via Supabase Dashboard (see instructions above).';
END $$;

-- ===========================
-- VERIFICATION
-- ===========================

DO $$
DECLARE
  admin_exists BOOLEAN;
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = 'bfe54383-7eb6-4581-969e-49a2b4b750d6') INTO admin_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9') INTO user_exists;

  RAISE NOTICE 'User verification:';
  RAISE NOTICE '  Admin user (bfe54383...): %', CASE WHEN admin_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
  RAISE NOTICE '  Regular user (65a9651d...): %', CASE WHEN user_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;

  IF NOT admin_exists OR NOT user_exists THEN
    RAISE WARNING 'Some users are missing. Please create them manually via Supabase Dashboard.';
    RAISE NOTICE '';
    RAISE NOTICE 'Test credentials for manual creation:';
    RAISE NOTICE '  Admin: admin@fitness-tracker.local / Admin123!@#';
    RAISE NOTICE '  User: user@fitness-tracker.local / User123!@#';
  END IF;
END $$;
