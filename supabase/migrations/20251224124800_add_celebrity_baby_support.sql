-- Add celebrity_match_id column to babies table for celebrity baby generation
-- This allows generating babies with celebrities while keeping all baby data in one table

ALTER TABLE public.babies
ADD COLUMN celebrity_match_id UUID REFERENCES public.celebrity_matches(id) ON DELETE SET NULL;

-- Add a check constraint to ensure either match_id OR celebrity_match_id is set (not both)
ALTER TABLE public.babies
ADD CONSTRAINT babies_match_or_celebrity_check
CHECK (
  (match_id IS NOT NULL AND celebrity_match_id IS NULL) OR
  (match_id IS NULL AND celebrity_match_id IS NOT NULL)
);

-- Make match_id nullable since celebrity babies won't have a match_id
ALTER TABLE public.babies
ALTER COLUMN match_id DROP NOT NULL;

-- Create index for celebrity_match_id for faster lookups
CREATE INDEX idx_babies_celebrity_match_id ON public.babies(celebrity_match_id);

-- Add comment for documentation
COMMENT ON COLUMN public.babies.celebrity_match_id IS 'Reference to celebrity_matches table for babies generated with celebrities';
