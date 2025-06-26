
-- Create player_stats table to track battle statistics
CREATE TABLE public.player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  total_battles INTEGER NOT NULL DEFAULT 0,
  total_victories INTEGER NOT NULL DEFAULT 0,
  best_tap_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update player stats after match completion
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when match status changes to 'completed'
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Get tap results for this match
    WITH match_results AS (
      SELECT 
        wallet_address,
        score,
        CASE WHEN wallet_address = NEW.winner_wallet THEN 1 ELSE 0 END as is_winner
      FROM tap_results 
      WHERE match_id = NEW.id
    )
    -- Update stats for each player
    INSERT INTO player_stats (wallet_address, total_battles, total_victories, best_tap_count)
    SELECT 
      wallet_address,
      1,
      is_winner,
      score
    FROM match_results
    ON CONFLICT (wallet_address) DO UPDATE SET
      total_battles = player_stats.total_battles + 1,
      total_victories = player_stats.total_victories + EXCLUDED.total_victories,
      best_tap_count = GREATEST(player_stats.best_tap_count, EXCLUDED.best_tap_count),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update player stats when matches complete
CREATE TRIGGER update_player_stats_trigger
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats();
