
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  creator_wallet: string;
  opponent_wallet: string | null;
  wager: number;
  status: string;
  is_quick_game?: boolean;
  is_private?: boolean;
  winner_wallet: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface TapResult {
  id: string;
  match_id: string;
  wallet_address: string;
  score: number;
  signature: string;
  timestamp: string;
  submitted_at: string;
}

interface PlayerStats {
  id: string;
  wallet_address: string;
  total_battles: number;
  total_victories: number;
  best_tap_count: number;
  created_at: string;
  updated_at: string;
}

// Cache for player stats to reduce API calls
const playerStatsCache = new Map<string, { data: PlayerStats; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'waiting')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load active matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = async (walletAddress: string): Promise<PlayerStats | null> => {
    // Check cache first
    const cached = playerStatsCache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('wallet_address', walletAddress)
        .limit(1)
        .maybeSingle();

      const defaultStats = {
        id: '',
        wallet_address: walletAddress,
        total_battles: 0,
        total_victories: 0,
        best_tap_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (error) {
        console.warn('Error fetching player stats, using defaults:', error.message);
        return defaultStats;
      }
      
      const result = data || defaultStats;
      
      // Cache the result
      playerStatsCache.set(walletAddress, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.warn('Error fetching player stats, using defaults:', error);
      return {
        id: '',
        wallet_address: walletAddress,
        total_battles: 0,
        total_victories: 0,
        best_tap_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  };

  const getCompletedMatches = async (walletAddress: string): Promise<Match[]> => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'completed')
        .or(`creator_wallet.eq.${walletAddress},opponent_wallet.eq.${walletAddress}`)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as Match[] || [];
    } catch (error) {
      console.error('Error fetching completed matches:', error);
      return [];
    }
  };

  const getMatchWithResults = async (matchId: string) => {
    try {
      const [matchResult, tapResultsResult] = await Promise.all([
        supabase.from('matches').select('*').eq('id', matchId).single(),
        supabase.from('tap_results').select('*').eq('match_id', matchId)
      ]);

      if (matchResult.error) throw matchResult.error;
      if (tapResultsResult.error) throw tapResultsResult.error;

      return {
        match: matchResult.data,
        tapResults: tapResultsResult.data
      };
    } catch (error) {
      console.error('Error fetching match with results:', error);
      return null;
    }
  };

  const createMatch = async (walletAddress: string, wager: number, isQuickGame = false, isPrivate = false) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          creator_wallet: walletAddress,
          wager: wager,
          status: 'waiting',
          is_quick_game: isQuickGame,
          is_private: isPrivate
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchMatches();
      return data;
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create battle",
        variant: "destructive"
      });
      throw error;
    }
  };

  const joinMatch = async (matchId: string, walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          opponent_wallet: walletAddress,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .eq('status', 'waiting')
        .select()
        .single();

      if (error) {
        console.error('Error joining match:', error);
        throw error;
      }

      toast({
        title: "⚡ Battle Joined!",
        description: "Game starting now!",
      });

      await fetchMatches();
      return data;
    } catch (error) {
      console.error('Error joining match:', error);
      toast({
        title: "Error",
        description: "Failed to join battle",
        variant: "destructive"
      });
      throw error;
    }
  };

  const submitTapResult = async (matchId: string, walletAddress: string, score: number, signature: string) => {
    try {
      console.log('Submitting tap result for match:', matchId, 'wallet:', walletAddress, 'score:', score);

      // Check if this player already submitted a result
      const { data: existingResult, error: checkError } = await supabase
        .from('tap_results')
        .select('*')
        .eq('match_id', matchId)
        .eq('wallet_address', walletAddress)
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing result:', checkError);
        throw new Error(`Failed to check existing result: ${checkError.message}`);
      }

      if (existingResult) {
        console.log('Result already exists, returning existing result');
        return existingResult;
      }

      // Submit new result
      const { data: newResult, error: insertError } = await supabase
        .from('tap_results')
        .insert([{
          match_id: matchId,
          wallet_address: walletAddress,
          score: score,
          signature: signature,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting tap result:', insertError);
        throw new Error(`Failed to submit result: ${insertError.message}`);
      }

      console.log('Successfully submitted tap result:', newResult);

      // Check if both players have submitted results
      const { data: allResults, error: resultsError } = await supabase
        .from('tap_results')
        .select('*')
        .eq('match_id', matchId);

      if (resultsError) {
        console.error('Error fetching all results:', resultsError);
        // Don't throw here - the result was submitted successfully
        return newResult;
      }

      if (allResults && allResults.length === 2) {
        console.log('Both players submitted, determining winner');
        // Determine winner and complete match
        const [result1, result2] = allResults;
        const winner = result1.score > result2.score ? result1.wallet_address : 
                      result2.score > result1.score ? result2.wallet_address : 
                      null; // Handle ties

        const { error: updateError } = await supabase
          .from('matches')
          .update({
            status: 'completed',
            winner_wallet: winner,
            completed_at: new Date().toISOString()
          })
          .eq('id', matchId);

        if (updateError) {
          console.error('Error updating match status:', updateError);
          // Don't throw here - the result was still submitted successfully
        }

        // Clear player stats cache for both players to force refresh
        playerStatsCache.delete(result1.wallet_address);
        playerStatsCache.delete(result2.wallet_address);

        const winnerText = winner === walletAddress ? "🎉 Victory!" : 
                          winner === null ? "🤝 Tie Game!" : "💀 Defeat";
        
        toast({
          title: winnerText,
          description: `Final scores: ${result1.score} vs ${result2.score}`,
        });
      } else {
        toast({
          title: "✅ Score Submitted!",
          description: "Waiting for opponent to finish...",
        });
      }

      return newResult;
    } catch (error) {
      console.error('Tap result submission failed:', error);
      
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit result",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getMatch = async (matchId: string): Promise<Match | null> => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      return data as Match;
    } catch (error) {
      console.error('Error fetching match:', error);
      return null;
    }
  };

  const getTapResults = async (matchId: string): Promise<TapResult[]> => {
    try {
      const { data, error } = await supabase
        .from('tap_results')
        .select('*')
        .eq('match_id', matchId);

      if (error) throw error;
      return data as TapResult[];
    } catch (error) {
      console.error('Error fetching tap results:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to real-time updates with reduced frequency
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          // Debounce the fetch to avoid excessive calls
          setTimeout(() => {
            fetchMatches();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    matches,
    loading,
    createMatch,
    joinMatch,
    submitTapResult,
    getMatch,
    getTapResults,
    getPlayerStats,
    getCompletedMatches,
    getMatchWithResults,
    refetch: fetchMatches
  };
};
