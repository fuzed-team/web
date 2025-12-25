-- Add original_image_path column to celebrities table
-- This stores the path to the original image (before background removal)
ALTER TABLE celebrities ADD COLUMN IF NOT EXISTS original_image_path TEXT;

-- Add comment for documentation
COMMENT ON COLUMN celebrities.original_image_path IS 'Path to the original image in Supabase Storage (before background removal)';
COMMENT ON COLUMN celebrities.image_path IS 'Path to the processed image in Supabase Storage (with background removed, PNG format)';
