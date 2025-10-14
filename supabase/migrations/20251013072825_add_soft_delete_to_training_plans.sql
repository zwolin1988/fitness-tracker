-- Migration: Add soft delete support to training_plans and workout tables
-- Date: 2025-01-13
-- Description:
--   1. Add deleted_at column to training_plans for soft delete
--   2. Add training_plan_id to workouts table
--   3. Update indexes and policies

-- ===========================
-- 1. Add deleted_at to training_plans
-- ===========================

ALTER TABLE training_plans
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN training_plans.deleted_at IS 'Soft delete timestamp - NULL means active, non-NULL means deleted';

-- Create index for efficient filtering of non-deleted plans
CREATE INDEX IF NOT EXISTS idx_training_plans_deleted_at
  ON training_plans(user_id, deleted_at)
  WHERE deleted_at IS NULL;

-- ===========================
-- 2. Add training_plan_id to workouts
-- ===========================

ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS training_plan_id UUID REFERENCES training_plans(id);

COMMENT ON COLUMN workouts.training_plan_id IS 'Reference to the training plan this workout was based on (can be deleted plan)';

-- Create index for workouts by plan
CREATE INDEX IF NOT EXISTS idx_workouts_training_plan_id
  ON workouts(training_plan_id);

-- ===========================
-- 3. Update RLS policies (if needed)
-- ===========================

-- Training plans: Users can only see their own non-deleted plans
DROP POLICY IF EXISTS "Users can view their own training plans" ON training_plans;
CREATE POLICY "Users can view their own active training plans"
  ON training_plans FOR SELECT
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
  );

-- Note: Admin users should still see all plans including deleted ones
-- Add admin policy if needed

-- ===========================
-- 4. Migration verification
-- ===========================

-- Verify column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'training_plans'
    AND column_name = 'deleted_at'
  ) THEN
    RAISE EXCEPTION 'Migration failed: deleted_at column not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workouts'
    AND column_name = 'training_plan_id'
  ) THEN
    RAISE EXCEPTION 'Migration failed: training_plan_id column not created';
  END IF;
END $$;
