-- Migration: 029_celebrity_daily_rotation.sql
-- Description: Add daily rotation feature for celebrity of the day
-- Created: 2025-11-18
--
-- Changes:
-- 1. Add rotation fields to celebrities table (is_featured, featured_from, featured_until)
-- 2. Create index for featured celebrity queries
-- 3. Create rotate_daily_celebrity() function for automatic rotation
-- 4. Schedule pg_cron job to run daily at midnight UTC
-- 5. Initialize first celebrity of the day

-- Add rotation fields to celebrities table
ALTER TABLE celebrities
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Add index for performance on featured celebrity queries
CREATE INDEX IF NOT EXISTS idx_celebrities_featured
  ON celebrities(is_featured, featured_until)
  WHERE is_featured = true;

-- Create function to rotate daily celebrity
-- This function will be called by pg_cron daily at midnight
CREATE OR REPLACE FUNCTION rotate_daily_celebrity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Unfeature all celebrities (reset)
  UPDATE celebrities SET is_featured = false;

  -- Select ONE random celebrity and feature for 24 hours
  -- Only selects celebrities that have embeddings (quality check)
  UPDATE celebrities SET
    is_featured = true,
    featured_from = NOW(),
    featured_until = NOW() + INTERVAL '1 day'
  WHERE id = (
    SELECT id FROM celebrities
    WHERE embedding IS NOT NULL
      AND quality_score >= 0.6  -- Only high-quality celebrity images
    ORDER BY RANDOM()
    LIMIT 1  -- Only 1 celebrity for all users
  );

  -- Log the rotation for debugging
  RAISE NOTICE 'Celebrity of the day rotated at %', NOW();
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION rotate_daily_celebrity() IS
  'Rotates the featured celebrity of the day. Unfeatures all celebrities and randomly selects one high-quality celebrity to feature for 24 hours.';

-- Schedule daily rotation at midnight UTC using pg_cron
-- Note: pg_cron extension must be enabled in Supabase
SELECT cron.schedule(
  'rotate-daily-celebrity',           -- Job name
  '0 0 * * *',                        -- Cron schedule: Daily at midnight UTC
  $$SELECT rotate_daily_celebrity();$$ -- Command to execute
);

-- Initialize first celebrity of the day
-- This ensures there's always a celebrity featured when the migration runs
SELECT rotate_daily_celebrity();

-- Verify the migration
DO $$
DECLARE
  featured_count INTEGER;
  celeb_name TEXT;
BEGIN
  -- Count featured celebrities (should be exactly 1)
  SELECT COUNT(*) INTO featured_count
  FROM celebrities
  WHERE is_featured = true;

  -- Get the featured celebrity name
  SELECT name INTO celeb_name
  FROM celebrities
  WHERE is_featured = true
  LIMIT 1;

  -- Raise notice with results
  RAISE NOTICE 'Migration 029 completed successfully!';
  RAISE NOTICE 'Featured celebrities count: %', featured_count;
  RAISE NOTICE 'Current celebrity of the day: %', COALESCE(celeb_name, 'None');

  -- Verify exactly one celebrity is featured
  IF featured_count != 1 THEN
    RAISE WARNING 'Expected exactly 1 featured celebrity, but found %', featured_count;
  END IF;
END $$;
