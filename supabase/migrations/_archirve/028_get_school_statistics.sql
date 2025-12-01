-- Migration: Add get_school_statistics function for admin panel
-- Description: Provides school analytics for admin dashboard
-- Created: 2025-11-16

-- Function to get school statistics
CREATE OR REPLACE FUNCTION get_school_statistics()
RETURNS TABLE (
  school text,
  total_users bigint,
  active_users_7d bigint,
  total_matches bigint,
  avg_matches_per_user numeric
) AS $$
  SELECT
    p.school,
    COUNT(DISTINCT p.id) as total_users,
    COUNT(DISTINCT CASE
      WHEN p.last_seen > NOW() - INTERVAL '7 days' THEN p.id
      ELSE NULL
    END) as active_users_7d,
    COUNT(DISTINCT m.id) as total_matches,
    CASE
      WHEN COUNT(DISTINCT p.id) > 0 THEN
        ROUND(COUNT(DISTINCT m.id)::numeric / COUNT(DISTINCT p.id)::numeric, 2)
      ELSE 0
    END as avg_matches_per_user
  FROM profiles p
  LEFT JOIN faces f ON f.profile_id = p.id
  LEFT JOIN matches m ON (m.face_a_id = f.id OR m.face_b_id = f.id)
  WHERE p.school IS NOT NULL AND p.school != ''
  GROUP BY p.school
  ORDER BY total_users DESC;
$$ LANGUAGE sql STABLE;

-- Grant execute permission to authenticated users with admin role only
-- Note: Access control will be enforced in the API layer
GRANT EXECUTE ON FUNCTION get_school_statistics() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_school_statistics IS 'Returns statistics for all schools including user count, active users, and match metrics. Admin-only access enforced in API layer.';
