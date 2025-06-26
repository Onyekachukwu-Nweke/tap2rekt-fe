
-- Add privacy field to matches table
ALTER TABLE public.matches 
ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT false;

-- Update existing matches to be public by default
UPDATE public.matches 
SET is_private = false 
WHERE is_private IS NULL;
