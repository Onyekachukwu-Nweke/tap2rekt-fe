
-- Add columns to track deposit confirmations and winnings claims
ALTER TABLE public.matches 
ADD COLUMN creator_deposit_confirmed boolean DEFAULT false,
ADD COLUMN opponent_deposit_confirmed boolean DEFAULT false,
ADD COLUMN creator_deposit_signature text,
ADD COLUMN opponent_deposit_signature text,
ADD COLUMN winnings_claimed boolean DEFAULT false,
ADD COLUMN winnings_claimed_at timestamp with time zone;

-- Update existing matches to have proper default values
UPDATE public.matches 
SET creator_deposit_confirmed = false,
    opponent_deposit_confirmed = false,
    winnings_claimed = false
WHERE creator_deposit_confirmed IS NULL 
   OR opponent_deposit_confirmed IS NULL 
   OR winnings_claimed IS NULL;
