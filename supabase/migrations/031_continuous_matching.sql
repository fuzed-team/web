-- Add next_run_at column to match_jobs for continuous scheduling
ALTER TABLE match_jobs
ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMPTZ DEFAULT now();

-- Index for efficient polling
CREATE INDEX IF NOT EXISTS idx_match_jobs_next_run_at ON match_jobs(next_run_at);

-- Update existing pending jobs to have next_run_at = now()
UPDATE match_jobs 
SET next_run_at = now() 
WHERE status = 'pending' AND next_run_at IS NULL;
