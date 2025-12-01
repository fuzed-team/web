-- Remove unnecessary columns for simplified continuous matching
ALTER TABLE match_jobs
DROP COLUMN IF EXISTS last_match_window,
DROP COLUMN IF EXISTS matches_in_window;
