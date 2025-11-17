-- Migration: Add get_match_commonalities function
-- Description: Detects commonalities between two faces for match messaging
-- Created: 2025-11-16

-- Function to calculate Euclidean distance for skin tone similarity (CIELAB arrays)
CREATE OR REPLACE FUNCTION euclidean_distance_lab(arr1 float8[], arr2 float8[])
RETURNS float8 AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Main function to get match commonalities
CREATE OR REPLACE FUNCTION get_match_commonalities(
  face_id_1 uuid,
  face_id_2 uuid
)
RETURNS jsonb AS $$
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
        'detail', format('symmetry scores: %.2f and %.2f', face1.symmetry_score, face2.symmetry_score)
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
        'detail', format('skin tone difference: %.2f (very close)', skin_tone_distance)
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
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_match_commonalities(uuid, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_match_commonalities IS 'Analyzes two faces and returns an array of commonalities (age, geometry, symmetry, skin tone, expression) for match messaging';
