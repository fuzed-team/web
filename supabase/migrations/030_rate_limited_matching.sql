-- 1. Update match_jobs table
ALTER TABLE match_jobs
ADD COLUMN IF NOT EXISTS last_match_window TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS matches_in_window INT DEFAULT 0;

-- 2. Add System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
  (
    'match_rate_limit',
    '2'::jsonb,
    'Number of faces to match per user per time window'
  ),
  (
    'match_time_window_minutes',
    '60'::jsonb,
    'Time window in minutes for rate limiting (default: 60 = 1 hour)'
  )
ON CONFLICT (key) DO NOTHING;

-- 3. Update find_similar_faces_advanced function
CREATE OR REPLACE FUNCTION find_similar_faces_advanced(
    query_face_id uuid,
    user_school text,
    user_gender text,
    match_threshold float DEFAULT 0.7,
    match_count integer DEFAULT 20
)
RETURNS TABLE (
    face_id uuid,
    profile_id uuid,
    similarity float,
    image_path text,
    name text,
    age integer,
    expression text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, extensions
AS $$
BEGIN
    RETURN QUERY
    WITH query_face AS (
        SELECT f.embedding, f.age, f.symmetry_score, f.skin_tone_lab, f.expression, f.geometry_ratios
        FROM faces f WHERE f.id = query_face_id
    ),
    -- NEW: Get already matched faces directly from matches table
    already_matched AS (
        SELECT DISTINCT 
            CASE 
                WHEN face_a_id = query_face_id THEN face_b_id
                WHEN face_b_id = query_face_id THEN face_a_id
            END as matched_face_id
        FROM matches
        WHERE face_a_id = query_face_id OR face_b_id = query_face_id
    ),
    candidate_matches AS (
        SELECT f.id as face_id, p.id as profile_id,
            calculate_advanced_similarity(
                qf.embedding, qf.age, qf.symmetry_score, qf.skin_tone_lab, qf.expression, qf.geometry_ratios,
                f.embedding, f.age, f.symmetry_score, f.skin_tone_lab, f.expression, f.geometry_ratios
            ) as similarity,
            f.image_path, p.name, f.age, f.expression
        FROM faces f 
        CROSS JOIN query_face qf 
        JOIN profiles p ON f.profile_id = p.id
        LEFT JOIN already_matched am ON f.id = am.matched_face_id
        WHERE f.id != query_face_id 
            AND f.embedding IS NOT NULL 
            AND COALESCE(f.quality_score, 0.6) >= 0.6
            AND p.school = user_school 
            AND p.gender != user_gender
            AND p.default_face_id = f.id  -- Only match faces set as default
            AND am.matched_face_id IS NULL  -- Exclude already matched
    )
    SELECT cm.face_id, cm.profile_id, cm.similarity, cm.image_path, cm.name, cm.age, cm.expression
    FROM candidate_matches cm 
    WHERE cm.similarity >= match_threshold
    ORDER BY cm.similarity DESC 
    LIMIT match_count;
END;
$$;
