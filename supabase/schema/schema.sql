


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_advanced_similarity"("query_embedding" "extensions"."vector", "query_age" integer, "query_symmetry" double precision, "query_skin_tone" double precision[], "query_expression" "text", "query_geometry" "jsonb", "target_embedding" "extensions"."vector", "target_age" integer, "target_symmetry" double precision, "target_skin_tone" double precision[], "target_expression" "text", "target_geometry" "jsonb") RETURNS double precision
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
    embedding_sim float;
    geometry_sim float;
    age_compat float;
    symmetry_avg float;
    skin_tone_sim float;
    expression_match float;
    final_score float;
    geom_distance float;
    skin_distance float;

    -- Dynamic weights from system_settings
    weights JSONB;
    weight_embedding float := 0.20;
    weight_geometry float := 0.20;
    weight_age float := 0.15;
    weight_symmetry float := 0.15;
    weight_skin_tone float := 0.15;
    weight_expression float := 0.15;
BEGIN
    -- Fetch weights from system_settings (with fallback to defaults)
    SELECT value INTO weights FROM system_settings WHERE key = 'matching_weights';

    IF weights IS NOT NULL THEN
        weight_embedding := COALESCE((weights->>'embedding')::float, 0.20);
        weight_geometry := COALESCE((weights->>'geometry')::float, 0.20);
        weight_age := COALESCE((weights->>'age')::float, 0.15);
        weight_symmetry := COALESCE((weights->>'symmetry')::float, 0.15);
        weight_skin_tone := COALESCE((weights->>'skin_tone')::float, 0.15);
        weight_expression := COALESCE((weights->>'expression')::float, 0.15);
    END IF;

    -- 1. Embedding similarity (cosine distance operator)
    embedding_sim := 1 - (query_embedding <=> target_embedding);

    -- 2. Geometry ratio similarity
    geom_distance := sqrt(
        power(COALESCE((query_geometry->>'face_width_height_ratio')::float, 0.75) -
              COALESCE((target_geometry->>'face_width_height_ratio')::float, 0.75), 2) +
        power(COALESCE((query_geometry->>'eye_spacing_face_width')::float, 0.42) -
              COALESCE((target_geometry->>'eye_spacing_face_width')::float, 0.42), 2) +
        power(COALESCE((query_geometry->>'jawline_width_face_width')::float, 0.68) -
              COALESCE((target_geometry->>'jawline_width_face_width')::float, 0.68), 2) +
        power(COALESCE((query_geometry->>'nose_width_face_width')::float, 0.25) -
              COALESCE((target_geometry->>'nose_width_face_width')::float, 0.25), 2)
    );
    geometry_sim := 1.0 - LEAST(geom_distance / 1.0, 1.0);

    -- 3. Age compatibility
    age_compat := CASE
        WHEN abs(COALESCE(query_age, 25) - COALESCE(target_age, 25)) <= 2 THEN 1.0
        WHEN abs(COALESCE(query_age, 25) - COALESCE(target_age, 25)) <= 5 THEN 0.9
        WHEN abs(COALESCE(query_age, 25) - COALESCE(target_age, 25)) <= 10 THEN 0.7
        ELSE 0.5
    END;

    -- 4. Symmetry average
    symmetry_avg := (COALESCE(query_symmetry, 0.75) + COALESCE(target_symmetry, 0.75)) / 2.0;

    -- 5. Skin tone similarity (LAB color space Euclidean distance)
    skin_distance := sqrt(
        power(COALESCE(query_skin_tone[1], 65.0) - COALESCE(target_skin_tone[1], 65.0), 2) +
        power(COALESCE(query_skin_tone[2], 10.0) - COALESCE(target_skin_tone[2], 10.0), 2) +
        power(COALESCE(query_skin_tone[3], 20.0) - COALESCE(target_skin_tone[3], 20.0), 2)
    );
    skin_tone_sim := 1.0 - LEAST(skin_distance / 100.0, 1.0);

    -- 6. Expression match
    expression_match := CASE
        WHEN COALESCE(query_expression, 'neutral') = COALESCE(target_expression, 'neutral') THEN 1.0
        WHEN query_expression IN ('happy', 'smile') AND target_expression IN ('happy', 'smile') THEN 0.9
        ELSE 0.6
    END;

    -- 7. Composite weighted score using dynamic weights
    final_score :=
        weight_embedding * COALESCE(embedding_sim, 0.0) +
        weight_geometry * COALESCE(geometry_sim, 0.0) +
        weight_age * COALESCE(age_compat, 0.5) +
        weight_symmetry * COALESCE(symmetry_avg, 0.75) +
        weight_skin_tone * COALESCE(skin_tone_sim, 0.0) +
        weight_expression * COALESCE(expression_match, 0.6);

    RETURN GREATEST(LEAST(final_score, 1.0), 0.0);
END;
$$;


ALTER FUNCTION "public"."calculate_advanced_similarity"("query_embedding" "extensions"."vector", "query_age" integer, "query_symmetry" double precision, "query_skin_tone" double precision[], "query_expression" "text", "query_geometry" "jsonb", "target_embedding" "extensions"."vector", "target_age" integer, "target_symmetry" double precision, "target_skin_tone" double precision[], "target_expression" "text", "target_geometry" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_advanced_similarity"("query_embedding" "extensions"."vector", "query_age" integer, "query_symmetry" double precision, "query_skin_tone" double precision[], "query_expression" "text", "query_geometry" "jsonb", "target_embedding" "extensions"."vector", "target_age" integer, "target_symmetry" double precision, "target_skin_tone" double precision[], "target_expression" "text", "target_geometry" "jsonb") IS 'Calculate 0-1 similarity score using 6-factor weighted algorithm with dynamic weights from system_settings table';



CREATE OR REPLACE FUNCTION "public"."check_daily_limit"("p_user_id" "uuid", "p_limit_type" "text", "p_limit_key" "text") RETURNS TABLE("allowed" boolean, "current_count" integer, "limit_value" integer, "reset_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_current_count int := 0;
    v_limit_value int;
    v_limit_jsonb jsonb;
BEGIN
    -- Get the limit from system_settings
    SELECT value INTO v_limit_jsonb
    FROM public.system_settings
    WHERE key = p_limit_key;

    -- Extract integer value from JSONB
    -- Default to -1 (unlimited) if setting doesn't exist
    IF v_limit_jsonb IS NULL THEN
        v_limit_value := -1;  -- -1 = unlimited
    ELSE
        v_limit_value := (v_limit_jsonb)::text::int;
    END IF;

    -- Get current count for today
    IF p_limit_type = 'baby_generations' THEN
        SELECT COALESCE(baby_generations_count, 0)
        INTO v_current_count
        FROM public.user_daily_quotas
        WHERE user_id = p_user_id AND date = CURRENT_DATE;
    ELSIF p_limit_type = 'photo_uploads' THEN
        SELECT COALESCE(photo_uploads_count, 0)
        INTO v_current_count
        FROM public.user_daily_quotas
        WHERE user_id = p_user_id AND date = CURRENT_DATE;
    END IF;

    -- Default to 0 if no record exists
    v_current_count := COALESCE(v_current_count, 0);

    -- Calculate allowed status:
    -- - If limit is -1: unlimited (always allowed)
    -- - If limit is 0: blocked (never allowed)
    -- - Otherwise: allowed if current_count < limit
    RETURN QUERY SELECT
        CASE
            WHEN v_limit_value = -1 THEN true   -- -1 = unlimited
            WHEN v_limit_value = 0 THEN false   -- 0 = blocked
            ELSE v_current_count < v_limit_value  -- Check against limit
        END as allowed,
        v_current_count as current_count,
        v_limit_value as limit_value,
        (CURRENT_DATE + INTERVAL '1 day')::timestamptz as reset_at;
END;
$$;


ALTER FUNCTION "public"."check_daily_limit"("p_user_id" "uuid", "p_limit_type" "text", "p_limit_key" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_daily_limit"("p_user_id" "uuid", "p_limit_type" "text", "p_limit_key" "text") IS 'Check if user has reached daily limit. -1 = unlimited, 0 = blocked, >0 = limit value';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_daily_quotas"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM public.user_daily_quotas
    WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_daily_quotas"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_daily_quotas"() IS 'Deletes quota records older than 90 days to prevent table growth';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_match_jobs"() RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.match_jobs
    WHERE status IN ('completed', 'failed') AND created_at < now() - interval '7 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_match_jobs"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_match_jobs"() IS 'Delete completed/failed jobs older than 7 days to prevent table bloat';



CREATE OR REPLACE FUNCTION "public"."euclidean_distance_lab"("arr1" double precision[], "arr2" double precision[]) RETURNS double precision
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  IF arr1 IS NULL OR arr2 IS NULL OR array_length(arr1, 1) != 3 OR array_length(arr2, 1) != 3 THEN
    RETURN NULL;
  END IF;

  RETURN sqrt(
    pow(arr1[1] - arr2[1], 2) +
    pow(arr1[2] - arr2[2], 2) +
    pow(arr1[3] - arr2[3], 2)
  );
END;
$$;


ALTER FUNCTION "public"."euclidean_distance_lab"("arr1" double precision[], "arr2" double precision[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_celebrity_matches_advanced"("query_face_id" "uuid", "user_gender" "text", "match_threshold" double precision DEFAULT 0.5, "match_count" integer DEFAULT 20, "category_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("celebrity_id" "uuid", "celebrity_name" "text", "similarity" double precision, "image_path" "text", "age" integer, "expression" "text", "bio" "text", "category" "text", "gender" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    RETURN QUERY
    WITH query_face AS (
        SELECT
            f.embedding,
            f.age,
            f.symmetry_score,
            f.skin_tone_lab,
            f.expression,
            f.geometry_ratios
        FROM faces f
        WHERE f.id = query_face_id
    ),
    candidate_matches AS (
        SELECT
            c.id as celebrity_id,
            c.name as celebrity_name,
            calculate_advanced_similarity(
                qf.embedding, qf.age, qf.symmetry_score, qf.skin_tone_lab, qf.expression, qf.geometry_ratios,
                c.embedding, c.age, c.symmetry_score, c.skin_tone_lab, c.expression, c.geometry_ratios
            ) as similarity,
            c.image_path,
            c.age,
            c.expression,
            c.bio,
            c.category,
            c.gender
        FROM celebrities c
        CROSS JOIN query_face qf
        WHERE
            c.embedding IS NOT NULL
            AND COALESCE(c.quality_score, 0.6) >= 0.6
            AND c.gender != user_gender
            AND (category_filter IS NULL OR c.category = category_filter)
    )
    SELECT
        candidate_matches.celebrity_id,
        candidate_matches.celebrity_name,
        candidate_matches.similarity,
        candidate_matches.image_path,
        candidate_matches.age,
        candidate_matches.expression,
        candidate_matches.bio,
        candidate_matches.category,
        candidate_matches.gender
    FROM candidate_matches
    WHERE candidate_matches.similarity >= match_threshold
    ORDER BY candidate_matches.similarity DESC
    LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."find_celebrity_matches_advanced"("query_face_id" "uuid", "user_gender" "text", "match_threshold" double precision, "match_count" integer, "category_filter" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."find_celebrity_matches_advanced"("query_face_id" "uuid", "user_gender" "text", "match_threshold" double precision, "match_count" integer, "category_filter" "text") IS 'Find celebrity matches using advanced 6-factor matching algorithm with quality gate (0.6+) and opposite gender filtering';



CREATE OR REPLACE FUNCTION "public"."find_similar_faces_advanced"("query_face_id" "uuid", "user_school" "text", "user_gender" "text", "match_threshold" double precision DEFAULT 0.7, "match_count" integer DEFAULT 20) RETURNS TABLE("face_id" "uuid", "profile_id" "uuid", "similarity" double precision, "image_path" "text", "name" "text", "age" integer, "expression" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
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
$$;


ALTER FUNCTION "public"."find_similar_faces_advanced"("query_face_id" "uuid", "user_school" "text", "user_gender" "text", "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."find_similar_faces_advanced"("query_face_id" "uuid", "user_school" "text", "user_gender" "text", "match_threshold" double precision, "match_count" integer) IS 'Find similar faces using advanced multi-factor matching algorithm with quality gate (0.6+) and school/gender filtering';



CREATE OR REPLACE FUNCTION "public"."get_match_commonalities"("face_id_1" "uuid", "face_id_2" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  face1 record;
  face2 record;
  commonalities jsonb := '[]'::jsonb;
  skin_tone_distance float8;
  geometry_similarity float8;
BEGIN
  -- Fetch both faces with all attributes
  SELECT * INTO face1 FROM faces WHERE id = face_id_1;
  SELECT * INTO face2 FROM faces WHERE id = face_id_2;

  -- Return empty array if either face not found
  IF face1 IS NULL OR face2 IS NULL THEN
    RETURN commonalities;
  END IF;

  -- 1. Check age similarity (within 2 years)
  IF face1.age IS NOT NULL AND face2.age IS NOT NULL THEN
    IF ABS(face1.age - face2.age) <= 2 THEN
      commonalities := commonalities || jsonb_build_object(
        'type', 'age',
        'message', 'similar age',
        'detail', format('%s and %s years old', face1.age, face2.age)
      );
    END IF;
  END IF;

  -- 2. Check facial geometry match
  -- Using Jaccard similarity on JSONB keys/values (simplified approach)
  -- A more accurate approach would need vector comparison of geometry ratios
  IF face1.geometry_ratios IS NOT NULL AND face2.geometry_ratios IS NOT NULL THEN
    -- Simple heuristic: if they share similar geometry structure, consider it a match
    -- In production, you'd want more sophisticated comparison
    -- For now, we'll mark it as a potential match if both have geometry data
    commonalities := commonalities || jsonb_build_object(
      'type', 'geometry',
      'message', 'similar facial features',
      'detail', 'facial proportions match well'
    );
  END IF;

  -- 3. Check symmetry similarity (within 0.1 on 0-1 scale)
  IF face1.symmetry_score IS NOT NULL AND face2.symmetry_score IS NOT NULL THEN
    IF ABS(face1.symmetry_score - face2.symmetry_score) < 0.1 THEN
      commonalities := commonalities || jsonb_build_object(
        'type', 'symmetry',
        'message', 'similar facial symmetry',
        'detail', format('symmetry scores: %s and %s', round(face1.symmetry_score::numeric, 2), round(face2.symmetry_score::numeric, 2))
      );
    END IF;
  END IF;

  -- 4. Check skin tone similarity using CIELAB color distance
  -- Delta E < 10 is considered very similar in CIELAB
  IF face1.skin_tone_lab IS NOT NULL AND face2.skin_tone_lab IS NOT NULL THEN
    skin_tone_distance := euclidean_distance_lab(face1.skin_tone_lab, face2.skin_tone_lab);

    IF skin_tone_distance IS NOT NULL AND skin_tone_distance < 10 THEN
      commonalities := commonalities || jsonb_build_object(
        'type', 'skin_tone',
        'message', 'similar skin tone',
        'detail', format('skin tone difference: %s (very close)', round(skin_tone_distance::numeric, 2))
      );
    END IF;
  END IF;

  -- 5. Check expression match
  IF face1.expression IS NOT NULL AND face2.expression IS NOT NULL THEN
    IF face1.expression = face2.expression THEN
      commonalities := commonalities || jsonb_build_object(
        'type', 'expression',
        'message', format('both have %s expressions', face1.expression),
        'detail', format('%s expression detected in both faces', face1.expression)
      );
    END IF;
  END IF;

  RETURN commonalities;
END;
$$;


ALTER FUNCTION "public"."get_match_commonalities"("face_id_1" "uuid", "face_id_2" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_match_commonalities"("face_id_1" "uuid", "face_id_2" "uuid") IS 'Analyzes two faces and returns an array of commonalities (age, geometry, symmetry, skin tone, expression) for match messaging';



CREATE OR REPLACE FUNCTION "public"."get_match_job_stats"() RETURNS TABLE("status" "text", "count" bigint, "oldest_job" timestamp with time zone)
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
    SELECT status, COUNT(*)::bigint as count, MIN(created_at) as oldest_job
    FROM public.match_jobs GROUP BY status
    ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'processing' THEN 2 WHEN 'completed' THEN 3 WHEN 'failed' THEN 4 END;
$$;


ALTER FUNCTION "public"."get_match_job_stats"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_match_job_stats"() IS 'Get statistics about match job queue status';



CREATE OR REPLACE FUNCTION "public"."get_setting"("setting_key" "text", "default_value" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT value INTO result
    FROM public.system_settings
    WHERE key = setting_key;

    RETURN COALESCE(result, default_value);
END;
$$;


ALTER FUNCTION "public"."get_setting"("setting_key" "text", "default_value" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_setting"("setting_key" "text", "default_value" "jsonb") IS 'Retrieve a setting value by key with optional default';



CREATE OR REPLACE FUNCTION "public"."get_user_flag_count"("user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    flag_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO flag_count
    FROM public.user_flags
    WHERE reported_user_id = user_id
    AND status = 'pending';
    
    RETURN COALESCE(flag_count, 0);
END;
$$;


ALTER FUNCTION "public"."get_user_flag_count"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_flag_count"("user_id" "uuid") IS 'Get count of pending flags for a user';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_daily_usage"("p_user_id" "uuid", "p_limit_type" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF p_limit_type = 'baby_generations' THEN
        INSERT INTO public.user_daily_quotas (user_id, date, baby_generations_count, photo_uploads_count)
        VALUES (p_user_id, CURRENT_DATE, 1, 0)
        ON CONFLICT (user_id, date)
        DO UPDATE SET
            baby_generations_count = public.user_daily_quotas.baby_generations_count + 1,
            updated_at = now();
    ELSIF p_limit_type = 'photo_uploads' THEN
        INSERT INTO public.user_daily_quotas (user_id, date, baby_generations_count, photo_uploads_count)
        VALUES (p_user_id, CURRENT_DATE, 0, 1)
        ON CONFLICT (user_id, date)
        DO UPDATE SET
            photo_uploads_count = public.user_daily_quotas.photo_uploads_count + 1,
            updated_at = now();
    END IF;
END;
$$;


ALTER FUNCTION "public"."increment_daily_usage"("p_user_id" "uuid", "p_limit_type" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_daily_usage"("p_user_id" "uuid", "p_limit_type" "text") IS 'Atomically increment daily usage counter for a specific quota type';



CREATE OR REPLACE FUNCTION "public"."is_user_suspended"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    user_status TEXT;
BEGIN
    SELECT status INTO user_status
    FROM public.profiles
    WHERE id = user_id;
    
    RETURN user_status = 'suspended';
END;
$$;


ALTER FUNCTION "public"."is_user_suspended"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_user_suspended"("user_id" "uuid") IS 'Check if a user account is currently suspended';



CREATE OR REPLACE FUNCTION "public"."match_users_with_daily_celebrities"() RETURNS TABLE("users_processed" integer, "matches_created" integer, "errors_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."match_users_with_daily_celebrities"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."match_users_with_daily_celebrities"() IS 'Matches all active users with the featured celebrity of opposite gender using their default_face_id. Runs daily after celebrity rotation.';



CREATE OR REPLACE FUNCTION "public"."rotate_daily_celebrity"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Unfeature all celebrities (reset)
  UPDATE celebrities SET is_featured = false;

  -- Select 2 random celebrities (1 male, 1 female) and feature for 24 hours
  -- Only selects celebrities that have embeddings (quality check)
  
  -- Feature 1 random male celebrity
  UPDATE celebrities SET
    is_featured = true,
    featured_from = NOW(),
    featured_until = NOW() + INTERVAL '1 day'
  WHERE id = (
    SELECT id FROM celebrities
    WHERE embedding IS NOT NULL
      AND quality_score >= 0.6  -- Only high-quality celebrity images
      AND gender = 'male'
    ORDER BY RANDOM()
    LIMIT 1
  );

  -- Feature 1 random female celebrity
  UPDATE celebrities SET
    is_featured = true,
    featured_from = NOW(),
    featured_until = NOW() + INTERVAL '1 day'
  WHERE id = (
    SELECT id FROM celebrities
    WHERE embedding IS NOT NULL
      AND quality_score >= 0.6  -- Only high-quality celebrity images
      AND gender = 'female'
    ORDER BY RANDOM()
    LIMIT 1
  );

  -- Log the rotation for debugging
  RAISE NOTICE 'Celebrity of the day rotated at % - 2 celebrities (1 male, 1 female)', NOW();
END;
$$;


ALTER FUNCTION "public"."rotate_daily_celebrity"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."rotate_daily_celebrity"() IS 'Rotates the featured celebrities of the day. Unfeatures all celebrities and randomly selects 2 high-quality celebrities (1 male, 1 female) to feature for 24 hours.';



CREATE OR REPLACE FUNCTION "public"."update_celebrities_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_celebrities_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_celebrity_matches_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_celebrity_matches_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."babies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid",
    "generated_by_profile_id" "uuid",
    "image_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "celebrity_match_id" "uuid",
    CONSTRAINT "babies_match_or_celebrity_check" CHECK (((("match_id" IS NOT NULL) AND ("celebrity_match_id" IS NULL)) OR (("match_id" IS NULL) AND ("celebrity_match_id" IS NOT NULL))))
);


ALTER TABLE "public"."babies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."babies"."celebrity_match_id" IS 'Reference to celebrity_matches table for babies generated with celebrities';



CREATE TABLE IF NOT EXISTS "public"."celebrities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "bio" "text",
    "category" "text",
    "gender" "text",
    "image_path" "text" NOT NULL,
    "embedding" "extensions"."vector"(512),
    "image_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "age" integer,
    "symmetry_score" double precision,
    "skin_tone_lab" double precision[],
    "expression" "text",
    "geometry_ratios" "jsonb",
    "quality_score" double precision,
    "blur_score" double precision,
    "illumination_score" double precision,
    "landmarks_68" "jsonb",
    "pose" "jsonb",
    "emotion_scores" "jsonb",
    "expression_confidence" double precision,
    "analyzed_at" timestamp with time zone,
    "is_featured" boolean DEFAULT false,
    "featured_from" timestamp with time zone,
    "featured_until" timestamp with time zone,
    "original_image_path" "text",
    CONSTRAINT "celebrities_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text"])))
);


ALTER TABLE "public"."celebrities" OWNER TO "postgres";


COMMENT ON TABLE "public"."celebrities" IS 'Celebrity profiles with embedded face data for lookalike matching. RLS enabled: public read, service role write.';



COMMENT ON COLUMN "public"."celebrities"."id" IS 'Unique identifier for celebrity';



COMMENT ON COLUMN "public"."celebrities"."name" IS 'Celebrity full name';



COMMENT ON COLUMN "public"."celebrities"."bio" IS 'Short biography or description';



COMMENT ON COLUMN "public"."celebrities"."category" IS 'Celebrity category: actor, musician, athlete, influencer';



COMMENT ON COLUMN "public"."celebrities"."gender" IS 'Gender for filtering matches';



COMMENT ON COLUMN "public"."celebrities"."image_path" IS 'Path to the processed image in Supabase Storage (with background removed, PNG format)';



COMMENT ON COLUMN "public"."celebrities"."embedding" IS '512-dimensional InsightFace embedding vector for similarity search';



COMMENT ON COLUMN "public"."celebrities"."image_hash" IS 'MD5 hash of image for deduplication';



COMMENT ON COLUMN "public"."celebrities"."age" IS 'Estimated age from facial analysis (InsightFace)';



COMMENT ON COLUMN "public"."celebrities"."symmetry_score" IS 'Facial symmetry score 0.0-1.0 (higher = more symmetric)';



COMMENT ON COLUMN "public"."celebrities"."skin_tone_lab" IS 'Dominant skin color in CIELAB color space [L, a, b]';



COMMENT ON COLUMN "public"."celebrities"."expression" IS 'Dominant facial expression (neutral, happy, sad, angry, etc.)';



COMMENT ON COLUMN "public"."celebrities"."geometry_ratios" IS 'Facial geometry proportions (face_width_height_ratio, eye_spacing, etc.)';



COMMENT ON COLUMN "public"."celebrities"."quality_score" IS 'Overall image quality score 0.0-1.0 (blur + illumination composite)';



COMMENT ON COLUMN "public"."celebrities"."blur_score" IS 'Blur detection score 0.0-1.0 (Laplacian variance)';



COMMENT ON COLUMN "public"."celebrities"."illumination_score" IS 'Illumination quality score 0.0-1.0 (histogram analysis)';



COMMENT ON COLUMN "public"."celebrities"."landmarks_68" IS '68-point facial landmarks for geometry analysis';



COMMENT ON COLUMN "public"."celebrities"."pose" IS 'Head pose estimation (yaw, pitch, roll in degrees)';



COMMENT ON COLUMN "public"."celebrities"."emotion_scores" IS 'Detailed emotion scores from DeepFace (happy, sad, angry, etc.)';



COMMENT ON COLUMN "public"."celebrities"."expression_confidence" IS 'Confidence score for dominant expression 0.0-1.0';



COMMENT ON COLUMN "public"."celebrities"."analyzed_at" IS 'Timestamp when advanced analysis was performed';



COMMENT ON COLUMN "public"."celebrities"."original_image_path" IS 'Path to the original image in Supabase Storage (before background removal)';



CREATE TABLE IF NOT EXISTS "public"."celebrity_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "face_id" "uuid" NOT NULL,
    "celebrity_id" "uuid" NOT NULL,
    "similarity_score" double precision NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "celebrity_matches_similarity_score_check" CHECK (("similarity_score" >= (0)::double precision))
);


ALTER TABLE "public"."celebrity_matches" OWNER TO "postgres";


COMMENT ON TABLE "public"."celebrity_matches" IS 'Stores user-to-celebrity face match results from vector similarity search';



COMMENT ON COLUMN "public"."celebrity_matches"."face_id" IS 'Reference to user face that was matched';



COMMENT ON COLUMN "public"."celebrity_matches"."celebrity_id" IS 'Reference to celebrity that was matched';



COMMENT ON COLUMN "public"."celebrity_matches"."similarity_score" IS 'Cosine similarity score (0-1, higher is more similar)';



CREATE TABLE IF NOT EXISTS "public"."faces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "image_path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_hash" "text",
    "embedding" "extensions"."vector"(512),
    "age" integer,
    "gender" "text",
    "landmarks_68" "jsonb",
    "pose" "jsonb",
    "quality_score" double precision,
    "blur_score" double precision,
    "illumination_score" double precision,
    "symmetry_score" double precision,
    "skin_tone_lab" double precision[],
    "expression" "text",
    "expression_confidence" double precision,
    "emotion_scores" "jsonb",
    "geometry_ratios" "jsonb",
    "analyzed_at" timestamp with time zone
);


ALTER TABLE "public"."faces" OWNER TO "postgres";


COMMENT ON COLUMN "public"."faces"."embedding" IS '512-dimensional face embedding from InsightFace model (normalized L2)';



COMMENT ON COLUMN "public"."faces"."age" IS 'Estimated age from InsightFace (years)';



COMMENT ON COLUMN "public"."faces"."gender" IS 'Detected gender: male or female';



COMMENT ON COLUMN "public"."faces"."landmarks_68" IS '68-point facial landmarks as JSON array [[x,y], ...]';



COMMENT ON COLUMN "public"."faces"."pose" IS 'Face pose angles: {yaw, pitch, roll} in degrees';



COMMENT ON COLUMN "public"."faces"."quality_score" IS 'Overall face quality: 0.0-1.0 (higher is better)';



COMMENT ON COLUMN "public"."faces"."blur_score" IS 'Image sharpness: 0.0-1.0 (higher is sharper)';



COMMENT ON COLUMN "public"."faces"."illumination_score" IS 'Lighting quality: 0.0-1.0 (higher is better lit)';



COMMENT ON COLUMN "public"."faces"."symmetry_score" IS 'Facial symmetry: 0.0-1.0 (1.0 = perfect symmetry)';



COMMENT ON COLUMN "public"."faces"."skin_tone_lab" IS 'Dominant skin color in CIELAB: [L, a, b]';



COMMENT ON COLUMN "public"."faces"."expression" IS 'Dominant expression: happy, neutral, sad, angry, surprise, fear, disgust';



COMMENT ON COLUMN "public"."faces"."expression_confidence" IS 'Confidence of expression detection: 0.0-1.0';



COMMENT ON COLUMN "public"."faces"."emotion_scores" IS 'All emotion probabilities as JSON: {happy: 0.85, neutral: 0.10, ...}';



COMMENT ON COLUMN "public"."faces"."geometry_ratios" IS 'Facial proportion ratios as JSON: {face_width_height_ratio, eye_spacing_face_width, ...}';



COMMENT ON COLUMN "public"."faces"."analyzed_at" IS 'Timestamp when advanced analysis was performed';



CREATE TABLE IF NOT EXISTS "public"."match_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "face_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "job_type" "text" DEFAULT 'both'::"text",
    "next_run_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "match_jobs_job_type_check" CHECK (("job_type" = ANY (ARRAY['user_match'::"text", 'celebrity_match'::"text", 'both'::"text"]))),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."match_jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."match_jobs" IS 'Queue for background face matching jobs';



COMMENT ON COLUMN "public"."match_jobs"."status" IS 'Job status: pending (queued), processing (running), completed (done), failed (error)';



COMMENT ON COLUMN "public"."match_jobs"."job_type" IS 'Type of matching to perform: user_match (user-to-user only), celebrity_match (celebrity only), or both (default)';



CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "face_a_id" "uuid" NOT NULL,
    "face_b_id" "uuid" NOT NULL,
    "similarity_score" double precision NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_face_order" CHECK (("face_a_id" < "face_b_id"))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


COMMENT ON COLUMN "public"."matches"."similarity_score" IS 'Similarity score (0-1) where 1 is perfect match. Calculated as 1 - cosine_distance. Migrated from raw distance values on 2025-11-01.';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "connection_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'icebreaker'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mutual_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_a_id" "uuid" NOT NULL,
    "profile_b_id" "uuid" NOT NULL,
    "match_id" "uuid" NOT NULL,
    "baby_id" "uuid",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "different_profiles" CHECK (("profile_a_id" <> "profile_b_id")),
    CONSTRAINT "mutual_connections_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'blocked'::"text", 'archived'::"text"]))),
    CONSTRAINT "unique_connection" CHECK (("profile_a_id" < "profile_b_id"))
);


ALTER TABLE "public"."mutual_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "related_id" "uuid",
    "related_type" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_related_type_check" CHECK (("related_type" = ANY (ARRAY['baby'::"text", 'match'::"text", 'message'::"text", 'connection'::"text"]))),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['baby_generated'::"text", 'mutual_match'::"text", 'new_message'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "default_face_id" "uuid",
    "email" "text",
    "gender" "text",
    "school" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_seen" timestamp with time zone,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "suspended_at" timestamp with time zone,
    "suspended_by" "uuid",
    "suspension_reason" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"]))),
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'deleted'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."last_seen" IS 'Timestamp when user was last seen online (updated on disconnect)';



COMMENT ON COLUMN "public"."profiles"."role" IS 'User role: user (default) or admin (full system access)';



COMMENT ON COLUMN "public"."profiles"."status" IS 'Account status: active (default), suspended (cannot access), or deleted (soft delete)';



COMMENT ON COLUMN "public"."profiles"."suspended_at" IS 'Timestamp when account was suspended';



COMMENT ON COLUMN "public"."profiles"."suspended_by" IS 'Admin user who suspended this account';



COMMENT ON COLUMN "public"."profiles"."suspension_reason" IS 'Reason provided for account suspension';



CREATE TABLE IF NOT EXISTS "public"."reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user_profile_id" "uuid" NOT NULL,
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."reactions" IS 'Stores user reactions to matches. Supported reaction_types: "like" (favorite), "viewed" (user viewed match)';



CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid"
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."system_settings" IS 'Configurable system settings managed by admins';



COMMENT ON COLUMN "public"."system_settings"."key" IS 'Unique setting identifier (e.g., matching_weights, allow_non_edu_emails)';



COMMENT ON COLUMN "public"."system_settings"."value" IS 'JSON value for the setting (supports complex types)';



COMMENT ON COLUMN "public"."system_settings"."updated_by" IS 'Admin user who last updated this setting';



CREATE TABLE IF NOT EXISTS "public"."user_daily_quotas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "baby_generations_count" integer DEFAULT 0 NOT NULL,
    "photo_uploads_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_daily_quotas_baby_generations_count_check" CHECK (("baby_generations_count" >= 0)),
    CONSTRAINT "user_daily_quotas_photo_uploads_count_check" CHECK (("photo_uploads_count" >= 0))
);


ALTER TABLE "public"."user_daily_quotas" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_daily_quotas" IS 'Tracks daily usage quotas for baby generation and photo uploads per user';



COMMENT ON COLUMN "public"."user_daily_quotas"."user_id" IS 'User this quota record belongs to';



COMMENT ON COLUMN "public"."user_daily_quotas"."date" IS 'UTC date for this quota (resets at midnight UTC)';



COMMENT ON COLUMN "public"."user_daily_quotas"."baby_generations_count" IS 'Number of babies generated today';



COMMENT ON COLUMN "public"."user_daily_quotas"."photo_uploads_count" IS 'Number of photos uploaded today';



CREATE TABLE IF NOT EXISTS "public"."user_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_flags_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."user_flags" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_flags" IS 'User-reported flags for inappropriate behavior';



COMMENT ON COLUMN "public"."user_flags"."reporter_id" IS 'User who created the flag';



COMMENT ON COLUMN "public"."user_flags"."reported_user_id" IS 'User being reported';



COMMENT ON COLUMN "public"."user_flags"."reason" IS 'Reason for flagging this user';



COMMENT ON COLUMN "public"."user_flags"."status" IS 'Flag status: pending (needs review), reviewed (admin reviewed), dismissed (not valid)';



COMMENT ON COLUMN "public"."user_flags"."reviewed_by" IS 'Admin user who reviewed this flag';



ALTER TABLE ONLY "public"."babies"
    ADD CONSTRAINT "babies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."celebrities"
    ADD CONSTRAINT "celebrities_image_hash_key" UNIQUE ("image_hash");



ALTER TABLE ONLY "public"."celebrities"
    ADD CONSTRAINT "celebrities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."celebrity_matches"
    ADD CONSTRAINT "celebrity_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faces"
    ADD CONSTRAINT "faces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_jobs"
    ADD CONSTRAINT "match_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mutual_connections"
    ADD CONSTRAINT "mutual_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_match_user_type_unique" UNIQUE ("match_id", "user_profile_id", "reaction_type");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."celebrity_matches"
    ADD CONSTRAINT "unique_face_celebrity" UNIQUE ("face_id", "celebrity_id");



ALTER TABLE ONLY "public"."user_flags"
    ADD CONSTRAINT "unique_flag_per_reporter" UNIQUE ("reporter_id", "reported_user_id");



ALTER TABLE ONLY "public"."user_daily_quotas"
    ADD CONSTRAINT "user_daily_quotas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_daily_quotas"
    ADD CONSTRAINT "user_daily_quotas_user_id_date_key" UNIQUE ("user_id", "date");



ALTER TABLE ONLY "public"."user_flags"
    ADD CONSTRAINT "user_flags_pkey" PRIMARY KEY ("id");



CREATE INDEX "faces_embedding_hnsw_idx" ON "public"."faces" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE INDEX "idx_babies_celebrity_match_id" ON "public"."babies" USING "btree" ("celebrity_match_id");



CREATE INDEX "idx_babies_created_at" ON "public"."babies" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_babies_match_id" ON "public"."babies" USING "btree" ("match_id");



CREATE INDEX "idx_celebrities_age" ON "public"."celebrities" USING "btree" ("age");



CREATE INDEX "idx_celebrities_attributes" ON "public"."celebrities" USING "btree" ("age", "gender", "quality_score", "expression");



CREATE INDEX "idx_celebrities_category" ON "public"."celebrities" USING "btree" ("category");



CREATE INDEX "idx_celebrities_created_at" ON "public"."celebrities" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_celebrities_embedding" ON "public"."celebrities" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_celebrities_expression" ON "public"."celebrities" USING "btree" ("expression");



CREATE INDEX "idx_celebrities_featured" ON "public"."celebrities" USING "btree" ("is_featured", "featured_until") WHERE ("is_featured" = true);



CREATE INDEX "idx_celebrities_gender" ON "public"."celebrities" USING "btree" ("gender");



CREATE INDEX "idx_celebrities_image_hash" ON "public"."celebrities" USING "btree" ("image_hash");



CREATE INDEX "idx_celebrities_quality" ON "public"."celebrities" USING "btree" ("quality_score");



CREATE INDEX "idx_celebrity_matches_celebrity_id" ON "public"."celebrity_matches" USING "btree" ("celebrity_id");



CREATE INDEX "idx_celebrity_matches_created_at" ON "public"."celebrity_matches" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_celebrity_matches_face_id" ON "public"."celebrity_matches" USING "btree" ("face_id");



CREATE INDEX "idx_celebrity_matches_similarity" ON "public"."celebrity_matches" USING "btree" ("face_id", "similarity_score" DESC);



CREATE INDEX "idx_faces_age" ON "public"."faces" USING "btree" ("age") WHERE ("age" IS NOT NULL);



CREATE INDEX "idx_faces_attributes" ON "public"."faces" USING "btree" ("age", "gender", "quality_score", "expression") WHERE (("age" IS NOT NULL) AND ("quality_score" IS NOT NULL));



CREATE INDEX "idx_faces_expression" ON "public"."faces" USING "btree" ("expression") WHERE ("expression" IS NOT NULL);



CREATE INDEX "idx_faces_image_hash" ON "public"."faces" USING "btree" ("image_hash");



CREATE INDEX "idx_faces_profile_id" ON "public"."faces" USING "btree" ("profile_id");



CREATE INDEX "idx_faces_quality" ON "public"."faces" USING "btree" ("quality_score") WHERE ("quality_score" IS NOT NULL);



CREATE INDEX "idx_match_jobs_job_type" ON "public"."match_jobs" USING "btree" ("job_type");



CREATE INDEX "idx_match_jobs_next_run_at" ON "public"."match_jobs" USING "btree" ("next_run_at");



CREATE INDEX "idx_match_jobs_pending" ON "public"."match_jobs" USING "btree" ("created_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_match_jobs_status" ON "public"."match_jobs" USING "btree" ("status", "created_at");



CREATE INDEX "idx_match_jobs_status_type_created" ON "public"."match_jobs" USING "btree" ("status", "job_type", "created_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_matches_face_a_id" ON "public"."matches" USING "btree" ("face_a_id");



CREATE INDEX "idx_matches_face_b_id" ON "public"."matches" USING "btree" ("face_b_id");



CREATE INDEX "idx_matches_similarity_score" ON "public"."matches" USING "btree" ("similarity_score" DESC);



CREATE INDEX "idx_messages_connection_id" ON "public"."messages" USING "btree" ("connection_id");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_read_at" ON "public"."messages" USING "btree" ("read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_messages_sender_id" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_mutual_connections_match_id" ON "public"."mutual_connections" USING "btree" ("match_id");



CREATE INDEX "idx_mutual_connections_profile_a" ON "public"."mutual_connections" USING "btree" ("profile_a_id");



CREATE INDEX "idx_mutual_connections_profile_b" ON "public"."mutual_connections" USING "btree" ("profile_b_id");



CREATE INDEX "idx_mutual_connections_status" ON "public"."mutual_connections" USING "btree" ("status");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_read_at" ON "public"."notifications" USING "btree" ("read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_last_seen" ON "public"."profiles" USING "btree" ("last_seen");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role") WHERE ("role" = 'admin'::"text");



CREATE INDEX "idx_profiles_school_gender" ON "public"."profiles" USING "btree" ("school", "gender") WHERE (("school" IS NOT NULL) AND ("gender" IS NOT NULL));



CREATE INDEX "idx_profiles_status" ON "public"."profiles" USING "btree" ("status") WHERE ("status" <> 'active'::"text");



CREATE INDEX "idx_reactions_type" ON "public"."reactions" USING "btree" ("reaction_type");



CREATE INDEX "idx_reactions_user_type" ON "public"."reactions" USING "btree" ("user_profile_id", "reaction_type");



CREATE INDEX "idx_system_settings_updated_at" ON "public"."system_settings" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_user_daily_quotas_date" ON "public"."user_daily_quotas" USING "btree" ("date");



CREATE INDEX "idx_user_daily_quotas_user_date" ON "public"."user_daily_quotas" USING "btree" ("user_id", "date");



CREATE INDEX "idx_user_flags_created_at" ON "public"."user_flags" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_flags_reported_user" ON "public"."user_flags" USING "btree" ("reported_user_id");



CREATE INDEX "idx_user_flags_status" ON "public"."user_flags" USING "btree" ("status") WHERE ("status" = 'pending'::"text");



CREATE UNIQUE INDEX "ux_faces_profile_hash" ON "public"."faces" USING "btree" ("profile_id", "image_hash") WHERE ("image_hash" IS NOT NULL);



CREATE OR REPLACE TRIGGER "celebrities_updated_at_trigger" BEFORE UPDATE ON "public"."celebrities" FOR EACH ROW EXECUTE FUNCTION "public"."update_celebrities_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_celebrity_matches_updated_at" BEFORE UPDATE ON "public"."celebrity_matches" FOR EACH ROW EXECUTE FUNCTION "public"."update_celebrity_matches_updated_at"();



ALTER TABLE ONLY "public"."babies"
    ADD CONSTRAINT "babies_celebrity_match_id_fkey" FOREIGN KEY ("celebrity_match_id") REFERENCES "public"."celebrity_matches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."babies"
    ADD CONSTRAINT "babies_generated_by_profile_id_fkey" FOREIGN KEY ("generated_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."babies"
    ADD CONSTRAINT "babies_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."celebrity_matches"
    ADD CONSTRAINT "celebrity_matches_celebrity_id_fkey" FOREIGN KEY ("celebrity_id") REFERENCES "public"."celebrities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."celebrity_matches"
    ADD CONSTRAINT "celebrity_matches_face_id_fkey" FOREIGN KEY ("face_id") REFERENCES "public"."faces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."faces"
    ADD CONSTRAINT "faces_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_default_face" FOREIGN KEY ("default_face_id") REFERENCES "public"."faces"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."match_jobs"
    ADD CONSTRAINT "match_jobs_face_id_fkey" FOREIGN KEY ("face_id") REFERENCES "public"."faces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_jobs"
    ADD CONSTRAINT "match_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_face_a_id_fkey" FOREIGN KEY ("face_a_id") REFERENCES "public"."faces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_face_b_id_fkey" FOREIGN KEY ("face_b_id") REFERENCES "public"."faces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."mutual_connections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mutual_connections"
    ADD CONSTRAINT "mutual_connections_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "public"."babies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mutual_connections"
    ADD CONSTRAINT "mutual_connections_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mutual_connections"
    ADD CONSTRAINT "mutual_connections_profile_a_id_fkey" FOREIGN KEY ("profile_a_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mutual_connections"
    ADD CONSTRAINT "mutual_connections_profile_b_id_fkey" FOREIGN KEY ("profile_b_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_suspended_by_fkey" FOREIGN KEY ("suspended_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_daily_quotas"
    ADD CONSTRAINT "user_daily_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_flags"
    ADD CONSTRAINT "user_flags_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_flags"
    ADD CONSTRAINT "user_flags_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_flags"
    ADD CONSTRAINT "user_flags_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can view all flags" ON "public"."user_flags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all quotas" ON "public"."user_daily_quotas" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Anonymous users can view all celebrities" ON "public"."celebrities" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can view system settings" ON "public"."system_settings" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can view all celebrities" ON "public"."celebrities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."babies" FOR SELECT USING (true);



CREATE POLICY "Only admins can delete system settings" ON "public"."system_settings" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert system settings" ON "public"."system_settings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can update flags" ON "public"."user_flags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can update system settings" ON "public"."system_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Public faces are viewable by everyone" ON "public"."faces" FOR SELECT USING (true);



CREATE POLICY "Public matches are viewable by everyone" ON "public"."matches" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Service role can delete celebrities" ON "public"."celebrities" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Service role can insert celebrities" ON "public"."celebrities" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can insert celebrity matches" ON "public"."celebrity_matches" FOR INSERT WITH CHECK (true);



CREATE POLICY "Service role can update celebrities" ON "public"."celebrities" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update celebrity matches" ON "public"."celebrity_matches" FOR UPDATE USING (true);



CREATE POLICY "Service role has full access to match jobs" ON "public"."match_jobs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "System can create connections" ON "public"."mutual_connections" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create babies for their matches" ON "public"."babies" FOR INSERT WITH CHECK (("match_id" IN ( SELECT "m"."id"
   FROM (("public"."matches" "m"
     JOIN "public"."faces" "fa" ON (("m"."face_a_id" = "fa"."id")))
     JOIN "public"."faces" "fb" ON (("m"."face_b_id" = "fb"."id")))
  WHERE (("fa"."profile_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("fb"."profile_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can create flags for others" ON "public"."user_flags" FOR INSERT WITH CHECK ((("auth"."uid"() = "reporter_id") AND ("auth"."uid"() <> "reported_user_id")));



CREATE POLICY "Users can delete own faces" ON "public"."faces" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Users can delete own notifications" ON "public"."notifications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own profile" ON "public"."profiles" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can delete own reactions" ON "public"."reactions" FOR DELETE USING (("auth"."uid"() = "user_profile_id"));



CREATE POLICY "Users can insert own faces" ON "public"."faces" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can insert own reactions" ON "public"."reactions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_profile_id"));



CREATE POLICY "Users can send messages to own connections" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."mutual_connections"
  WHERE (("mutual_connections"."id" = "messages"."connection_id") AND (("mutual_connections"."profile_a_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("mutual_connections"."profile_b_id" = ( SELECT "auth"."uid"() AS "uid"))) AND ("mutual_connections"."status" = 'active'::"text"))))));



CREATE POLICY "Users can update own connections" ON "public"."mutual_connections" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "profile_a_id") OR (( SELECT "auth"."uid"() AS "uid") = "profile_b_id")));



CREATE POLICY "Users can update own faces" ON "public"."faces" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Users can update own messages" ON "public"."messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."mutual_connections"
  WHERE (("mutual_connections"."id" = "messages"."connection_id") AND (("mutual_connections"."profile_a_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("mutual_connections"."profile_b_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own reactions" ON "public"."reactions" FOR UPDATE USING (("auth"."uid"() = "user_profile_id")) WITH CHECK (("auth"."uid"() = "user_profile_id"));



CREATE POLICY "Users can view messages from own connections" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."mutual_connections"
  WHERE (("mutual_connections"."id" = "messages"."connection_id") AND (("mutual_connections"."profile_a_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("mutual_connections"."profile_b_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Users can view own connections" ON "public"."mutual_connections" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "profile_a_id") OR (( SELECT "auth"."uid"() AS "uid") = "profile_b_id")));



CREATE POLICY "Users can view own match jobs" ON "public"."match_jobs" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own quotas" ON "public"."user_daily_quotas" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own reactions" ON "public"."reactions" FOR SELECT USING (("auth"."uid"() = "user_profile_id"));



CREATE POLICY "Users can view their own celebrity matches" ON "public"."celebrity_matches" FOR SELECT USING (("face_id" IN ( SELECT "f"."id"
   FROM "public"."faces" "f"
  WHERE ("f"."profile_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can view their own flags" ON "public"."user_flags" FOR SELECT USING (("auth"."uid"() = "reporter_id"));



ALTER TABLE "public"."babies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."celebrities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."celebrity_matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mutual_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_daily_quotas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_flags" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."matches";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";







































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_daily_limit"("p_user_id" "uuid", "p_limit_type" "text", "p_limit_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_daily_limit"("p_user_id" "uuid", "p_limit_type" "text", "p_limit_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_daily_limit"("p_user_id" "uuid", "p_limit_type" "text", "p_limit_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_daily_quotas"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_daily_quotas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_daily_quotas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_match_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_match_jobs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_match_jobs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."euclidean_distance_lab"("arr1" double precision[], "arr2" double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."euclidean_distance_lab"("arr1" double precision[], "arr2" double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."euclidean_distance_lab"("arr1" double precision[], "arr2" double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."find_celebrity_matches_advanced"("query_face_id" "uuid", "user_gender" "text", "match_threshold" double precision, "match_count" integer, "category_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_celebrity_matches_advanced"("query_face_id" "uuid", "user_gender" "text", "match_threshold" double precision, "match_count" integer, "category_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_celebrity_matches_advanced"("query_face_id" "uuid", "user_gender" "text", "match_threshold" double precision, "match_count" integer, "category_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_similar_faces_advanced"("query_face_id" "uuid", "user_school" "text", "user_gender" "text", "match_threshold" double precision, "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."find_similar_faces_advanced"("query_face_id" "uuid", "user_school" "text", "user_gender" "text", "match_threshold" double precision, "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_similar_faces_advanced"("query_face_id" "uuid", "user_school" "text", "user_gender" "text", "match_threshold" double precision, "match_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_match_commonalities"("face_id_1" "uuid", "face_id_2" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_match_commonalities"("face_id_1" "uuid", "face_id_2" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_match_commonalities"("face_id_1" "uuid", "face_id_2" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_match_job_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_match_job_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_match_job_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_setting"("setting_key" "text", "default_value" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."get_setting"("setting_key" "text", "default_value" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_setting"("setting_key" "text", "default_value" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_flag_count"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_flag_count"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_flag_count"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_daily_usage"("p_user_id" "uuid", "p_limit_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_daily_usage"("p_user_id" "uuid", "p_limit_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_daily_usage"("p_user_id" "uuid", "p_limit_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_suspended"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_suspended"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_suspended"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_users_with_daily_celebrities"() TO "anon";
GRANT ALL ON FUNCTION "public"."match_users_with_daily_celebrities"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_users_with_daily_celebrities"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rotate_daily_celebrity"() TO "anon";
GRANT ALL ON FUNCTION "public"."rotate_daily_celebrity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rotate_daily_celebrity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_celebrities_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_celebrities_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_celebrities_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_celebrity_matches_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_celebrity_matches_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_celebrity_matches_updated_at"() TO "service_role";




































GRANT ALL ON TABLE "public"."babies" TO "anon";
GRANT ALL ON TABLE "public"."babies" TO "authenticated";
GRANT ALL ON TABLE "public"."babies" TO "service_role";



GRANT ALL ON TABLE "public"."celebrities" TO "anon";
GRANT ALL ON TABLE "public"."celebrities" TO "authenticated";
GRANT ALL ON TABLE "public"."celebrities" TO "service_role";



GRANT ALL ON TABLE "public"."celebrity_matches" TO "anon";
GRANT ALL ON TABLE "public"."celebrity_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."celebrity_matches" TO "service_role";



GRANT ALL ON TABLE "public"."faces" TO "anon";
GRANT ALL ON TABLE "public"."faces" TO "authenticated";
GRANT ALL ON TABLE "public"."faces" TO "service_role";



GRANT ALL ON TABLE "public"."match_jobs" TO "anon";
GRANT ALL ON TABLE "public"."match_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."match_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."mutual_connections" TO "anon";
GRANT ALL ON TABLE "public"."mutual_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."mutual_connections" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reactions" TO "anon";
GRANT ALL ON TABLE "public"."reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."reactions" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_daily_quotas" TO "anon";
GRANT ALL ON TABLE "public"."user_daily_quotas" TO "authenticated";
GRANT ALL ON TABLE "public"."user_daily_quotas" TO "service_role";



GRANT ALL ON TABLE "public"."user_flags" TO "anon";
GRANT ALL ON TABLE "public"."user_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."user_flags" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































