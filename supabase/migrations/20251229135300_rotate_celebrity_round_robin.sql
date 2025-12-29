-- Migration: Update rotate_daily_celebrity function to use round-robin selection
-- This ensures all celebrities get featured before any repeats

CREATE OR REPLACE FUNCTION "public"."rotate_daily_celebrity"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Unfeature all celebrities (reset is_featured only, keep featured_from for history)
  UPDATE celebrities SET is_featured = false;

  -- Round-robin selection: prioritize never-featured (NULL), then oldest featured
  -- Only selects celebrities that have embeddings and quality_score >= 0.6
  
  -- Feature 1 male celebrity (round-robin)
  UPDATE celebrities SET
    is_featured = true,
    featured_from = NOW(),
    featured_until = NOW() + INTERVAL '1 day'
  WHERE id = (
    SELECT id FROM celebrities
    WHERE embedding IS NOT NULL
      AND quality_score >= 0.6
      AND gender = 'male'
    ORDER BY featured_from NULLS FIRST, featured_from ASC
    LIMIT 1
  );

  -- Feature 1 female celebrity (round-robin)
  UPDATE celebrities SET
    is_featured = true,
    featured_from = NOW(),
    featured_until = NOW() + INTERVAL '1 day'
  WHERE id = (
    SELECT id FROM celebrities
    WHERE embedding IS NOT NULL
      AND quality_score >= 0.6
      AND gender = 'female'
    ORDER BY featured_from NULLS FIRST, featured_from ASC
    LIMIT 1
  );

  -- Log the rotation for debugging
  RAISE NOTICE 'Celebrity of the day rotated at % - round-robin selection (1 male, 1 female)', NOW();
END;
$$;

COMMENT ON FUNCTION "public"."rotate_daily_celebrity"() IS 'Rotates the featured celebrities of the day using round-robin selection. Unfeatures all celebrities and selects 2 high-quality celebrities (1 male, 1 female) to feature for 24 hours. Prioritizes never-featured celebrities, then oldest-featured to ensure fair rotation.';
