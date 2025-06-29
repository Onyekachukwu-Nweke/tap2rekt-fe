import { useState, useEffect, useRef, useCallback } from 'react';
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
  creator_deposit_confirmed?: boolean;
  opponent_deposit_confirmed?: boolean;
  creator_deposit_signature?: string;
  opponent_deposit_signature?: string;
  winnings_claimed?: boolean;
  winnings_claimed_at?: string;
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

// Enhanced cache with TTL and size limits
const playerStatsCache = new Map<string, { data: PlayerStats; timestamp: number }>();
const matchCache = new Map<string, { data: Match; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute
const MAX_CACHE_SIZE = 100;

// Cache cleanup function
const cleanupCache = (cache: Map<string, any>) => {
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.slice(0, cache.size - MAX_CACHE_SIZE).forEach(([key]) => {
      cache.delete(key);
    });
  }
};

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Prevent multiple simultaneous fetches
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchMatches = useCallback(async (force = false) => {
    // Prevent excessive calls
    const now = Date.now();
    if (!force && (fetchingRef.current || now - lastFetchRef.current < 5000)) {
      return;
    }

    if (!mountedRef.current) return;

    fetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'waiting')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(20); // Limit results

      if (error) throw error;
      
      if (mountedRef.current) {
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load active matches",
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [toast]);

  const getPlayerStats = useCallback(async (walletAddress: string): Promise<PlayerStats | null> => {
    if (!walletAddress) return null;

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

      const result = data || defaultStats;
      
      // Cache with cleanup
      playerStatsCache.set(walletAddress, {
        data: result,
        timestamp: Date.now()
      });
      cleanupCache(playerStatsCache);

      return result;
    } catch (error) {
      console.warn('Error fetching player stats:', error);
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
  }, []);

  const getMatch = useCallback(async (matchId: string): Promise<Match | null> => {
    if (!matchId) return null;

    // Check cache first
    const cached = matchCache.get(matchId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      
      // Cache with cleanup
      matchCache.set(matchId, {
        data: data as Match,
        timestamp: Date.now()
      });
      cleanupCache(matchCache);

      return data as Match;
    } catch (error) {
      console.error('Error fetching match:', error);
      return null;
    }
  }, []);

  const getCompletedMatches = async (walletAddress: string): Promise<Match[]> => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'completed')
        .or(`creator_wallet.eq.${walletAddress},opponent_wallet.eq.${walletAddress}`)
        .order('completed_at', { ascending: false })
        .limit(10); // Limit results

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

      // Clear cache and refetch
      matchCache.clear();
      await fetchMatches(true);
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

      // Clear cache and refetch
      matchCache.delete(matchId);
      await fetchMatches(true);
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
      const { data: tapResult, error: tapError } = await supabase
        .from('tap_results')
        .upsert({
          match_id: matchId,
          wallet_address: walletAddress,
          score: score,
          signature: signature,
          timestamp: new Date().toISOString()
        }, {
          onConflict: 'match_id,wallet_address',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (tapError) {
        throw new Error(`Failed to submit result: ${tapError.message}`);
      }

      // Check if both players have submitted
      const { data: allResults, error: resultsError } = await supabase
        .from('tap_results')
        .select('wallet_address, score')
        .eq('match_id', matchId);

      if (resultsError) {
        return tapResult;
      }

      if (allResults && allResults.length === 2) {
        const [result1, result2] = allResults;
        const winner = result1.score > result2.score ? result1.wallet_address : 
                      result2.score > result1.score ? result2.wallet_address : 
                      null;

        const { data: updatedMatch, error: updateError } = await supabase
          .from('matches')
          .update({
            status: 'completed',
            winner_wallet: winner,
            completed_at: new Date().toISOString()
          })
          .eq('id', matchId)
          .eq('status', 'in_progress')
          .select()
          .maybeSingle();

        if (!updateError && updatedMatch) {
          // Clear relevant caches
          matchCache.delete(matchId);
          result1.wallet_address && playerStatsCache.delete(result1.wallet_address);
          result2.wallet_address && playerStatsCache.delete(result2.wallet_address);

          const winnerText = winner === walletAddress ? "🎉 Victory!" : 
                            winner === null ? "🤝 Tie Game!" : "💀 Defeat";
          
          toast({
            title: winnerText,
            description: `Final scores: ${result1.score} vs ${result2.score}`,
          });
        }
      } else {
        toast({
          title: "✅ Score Submitted!",
          description: "Waiting for opponent to finish...",
        });
      }

      return tapResult;
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

  // Initial load and subscription with throttling
  useEffect(() => {
    fetchMatches(true);

    // Throttled subscription
    let timeoutId: NodeJS.Timeout;
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
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            if (mountedRef.current) {
              fetchMatches(true);
            }
          }, 3000); // Increased debounce time
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchMatches]);

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
    refetch: () => fetchMatches(true)
  };
};
