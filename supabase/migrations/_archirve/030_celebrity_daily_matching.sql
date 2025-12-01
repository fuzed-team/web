-- Migration: 030_celebrity_daily_matching.sql
-- Description: Create function to match all users with their featured opposite-gender celebrity daily
-- Created: 2025-11-29
--
-- Changes:
-- 1. Create match_users_with_daily_celebrities() function
-- 2. This function matches each user with the featured celebrity of opposite gender
-- 3. Uses user's default_face_id for matching
-- 4. Schedule pg_cron job to run daily at 00:05 UTC (5 minutes after rotation)

-- Create function to match users with featured celebrities
CREATE OR REPLACE FUNCTION match_users_with_daily_celebrities()
RETURNS TABLE (
  users_processed INTEGER,
  matches_created INTEGER,
  errors_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_users_processed INTEGER := 0;
  v_matches_created INTEGER := 0;
  v_errors_count INTEGER := 0;
  v_user_record RECORD;
  v_celebrity_record RECORD;
  v_face_record RECORD;
  v_similarity FLOAT;
  v_match_threshold FLOAT;
BEGIN
  -- Get match threshold from settings (default to 0.5)
  SELECT COALESCE(value::float, 0.5) INTO v_match_threshold
  FROM system_settings
  WHERE key = 'match_threshold';

  -- Log start
  RAISE NOTICE 'Starting daily celebrity matching at %', NOW();

  -- Iterate through all active users with default_face_id set
  FOR v_user_record IN
    SELECT id, gender, default_face_id
    FROM profiles
    WHERE default_face_id IS NOT NULL
      AND gender IN ('male', 'female')
  LOOP
    v_users_processed := v_users_processed + 1;

    BEGIN
      -- Get the user's face details
      SELECT embedding, age, symmetry_score, skin_tone_lab, expression, geometry_ratios
      INTO v_face_record
      FROM faces
      WHERE id = v_user_record.default_face_id;

      -- Skip if face doesn't have embedding
      IF v_face_record.embedding IS NULL THEN
        RAISE NOTICE 'Skipping user % - no embedding for default face', v_user_record.id;
        CONTINUE;
      END IF;

      -- Get the featured celebrity of opposite gender
      SELECT c.id, c.name, c.embedding, c.age, c.symmetry_score, 
             c.skin_tone_lab, c.expression, c.geometry_ratios
      INTO v_celebrity_record
      FROM celebrities c
      WHERE c.is_featured = true
        AND c.gender != v_user_record.gender  -- Opposite gender only
        AND c.embedding IS NOT NULL
        AND NOW() BETWEEN c.featured_from AND c.featured_until
      LIMIT 1;

      -- Skip if no featured celebrity found for opposite gender
      IF v_celebrity_record.id IS NULL THEN
        RAISE NOTICE 'No featured % celebrity found for % user %',
          CASE WHEN v_user_record.gender = 'male' THEN 'female' ELSE 'male' END,
          v_user_record.gender,
          v_user_record.id;
        CONTINUE;
      END IF;

      -- Calculate similarity using the advanced algorithm
      v_similarity := calculate_advanced_similarity(
        v_face_record.embedding,
        v_face_record.age,
        v_face_record.symmetry_score,
        v_face_record.skin_tone_lab,
        v_face_record.expression,
        v_face_record.geometry_ratios,
        v_celebrity_record.embedding,
        v_celebrity_record.age,
        v_celebrity_record.symmetry_score,
        v_celebrity_record.skin_tone_lab,
        v_celebrity_record.expression,
        v_celebrity_record.geometry_ratios
      );

      -- Only create match if similarity meets threshold
      IF v_similarity >= v_match_threshold THEN
        -- Insert or update the celebrity match
        INSERT INTO celebrity_matches (face_id, celebrity_id, similarity_score)
        VALUES (v_user_record.default_face_id, v_celebrity_record.id, v_similarity)
        ON CONFLICT (face_id, celebrity_id)
        DO UPDATE SET
          similarity_score = EXCLUDED.similarity_score,
          updated_at = NOW();

        v_matches_created := v_matches_created + 1;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        v_errors_count := v_errors_count + 1;
        RAISE WARNING 'Error matching user % with celebrity: %', v_user_record.id, SQLERRM;
    END;
  END LOOP;

  -- Log completion
  RAISE NOTICE 'Daily celebrity matching completed: % users processed, % matches created, % errors',
    v_users_processed, v_matches_created, v_errors_count;

  -- Return summary
  RETURN QUERY SELECT v_users_processed, v_matches_created, v_errors_count;
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION match_users_with_daily_celebrities() IS
  'Matches all active users with the featured celebrity of opposite gender using their default_face_id. Runs daily after celebrity rotation.';

-- Schedule daily matching at 00:05 UTC (5 minutes after rotation)
-- This ensures the rotation completes before matching starts
SELECT cron.schedule(
  'match-users-with-daily-celebrities',  -- Job name
  '5 0 * * *',                            -- Cron schedule: Daily at 00:05 UTC
  $$SELECT * FROM match_users_with_daily_celebrities();$$  -- Command to execute
);

-- Run the function immediately to create initial matches
-- This ensures matches exist when the migration runs
SELECT * FROM match_users_with_daily_celebrities();

-- Verify the migration
DO $$
DECLARE
  v_result RECORD;
  v_job_count INTEGER;
BEGIN
  -- Check if cron job was created
  SELECT COUNT(*) INTO v_job_count
  FROM cron.job
  WHERE jobname = 'match-users-with-daily-celebrities';

  RAISE NOTICE 'Migration 030 completed successfully!';
  RAISE NOTICE 'Cron job created: %', v_job_count > 0;
  
  -- Show summary from the initial run
  FOR v_result IN
    SELECT * FROM match_users_with_daily_celebrities()
  LOOP
    RAISE NOTICE 'Initial matching: % users processed, % matches created, % errors',
      v_result.users_processed, v_result.matches_created, v_result.errors_count;
  END LOOP;
END $$;
