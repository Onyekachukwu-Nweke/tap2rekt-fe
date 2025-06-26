
-- First, remove duplicate tap_results keeping only the latest submission for each match_id + wallet_address combination
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY match_id, wallet_address ORDER BY submitted_at DESC NULLS LAST, timestamp DESC) as rn
  FROM public.tap_results
)
DELETE FROM public.tap_results 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.tap_results 
ADD CONSTRAINT tap_results_match_wallet_unique 
UNIQUE (match_id, wallet_address);
