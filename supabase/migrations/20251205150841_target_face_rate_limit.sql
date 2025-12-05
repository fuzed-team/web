-- Fix ambiguous face_id reference by renaming column in CTE
CREATE OR REPLACE FUNCTION public.find_similar_faces_advanced(query_face_id uuid, user_school text, user_gender text, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 20)
 RETURNS TABLE(face_id uuid, profile_id uuid, similarity double precision, image_path text, name text, age integer, expression text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    rate_limit int;
    rate_window_minutes int;
BEGIN
    -- Get rate limit settings from EXISTING keys
    SELECT value::int INTO rate_limit FROM system_settings WHERE key = 'match_rate_limit';
    SELECT value::int INTO rate_window_minutes FROM system_settings WHERE key = 'match_time_window_minutes';

    -- Default values if settings are missing (fallback)
    rate_limit := COALESCE(rate_limit, 2);
    rate_window_minutes := COALESCE(rate_window_minutes, 60); -- Default to 60 minutes (1 hour)

    RETURN QUERY
    WITH query_face AS (
        SELECT f.embedding, f.age, f.symmetry_score, f.skin_tone_lab, f.expression, f.geometry_ratios
        FROM faces f WHERE f.id = query_face_id
    ),
    -- Get already matched faces directly from matches table
    already_matched AS (
        SELECT DISTINCT 
            CASE 
                WHEN face_a_id = query_face_id THEN face_b_id
                WHEN face_b_id = query_face_id THEN face_a_id
            END as matched_face_id
        FROM matches
        WHERE face_a_id = query_face_id OR face_b_id = query_face_id
    ),
    -- NEW: Identify faces that have exceeded the match rate limit
    faces_over_rate_limit AS (
        SELECT matched_face_id as over_matched_face_id
        FROM (
            SELECT face_a_id as matched_face_id FROM matches 
            WHERE created_at > NOW() - (rate_window_minutes || ' minutes')::interval
            UNION ALL
            SELECT face_b_id as matched_face_id FROM matches 
            WHERE created_at > NOW() - (rate_window_minutes || ' minutes')::interval
        ) recent_matches
        GROUP BY matched_face_id
        HAVING COUNT(*) >= rate_limit
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
            AND f.id NOT IN (SELECT over_matched_face_id FROM faces_over_rate_limit) -- NEW: Exclude over-matched faces (fixed column name)
    )
    SELECT cm.face_id, cm.profile_id, cm.similarity, cm.image_path, cm.name, cm.age, cm.expression
    FROM candidate_matches cm 
    WHERE cm.similarity >= match_threshold
    ORDER BY cm.similarity DESC 
    LIMIT match_count;
END;
$function$;
