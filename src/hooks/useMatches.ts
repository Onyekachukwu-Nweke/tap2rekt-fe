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
        .eq('is_private', false) // Only show public matches
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
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PlayerStats || null;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
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
      console.log('Joining match:', matchId, 'with wallet:', walletAddress);
      
      const { data, error } = await supabase
        .from('matches')
        .update({
          opponent_wallet: walletAddress,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .eq('status', 'waiting') // Only join if still waiting
        .select()
        .single();

      if (error) {
        console.error('Error joining match:', error);
        throw error;
      }

      console.log('Successfully joined match:', data);

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
      console.log('Submitting tap result:', { matchId, walletAddress, score });
      
      const { data, error } = await supabase
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

      if (error) throw error;

      // Check if both players have submitted results
      const { data: allResults, error: resultsError } = await supabase
        .from('tap_results')
        .select('*')
        .eq('match_id', matchId);

      if (resultsError) throw resultsError;

      if (allResults && allResults.length === 2) {
        // Determine winner and complete match
        const [result1, result2] = allResults;
        const winner = result1.score > result2.score ? result1.wallet_address : result2.wallet_address;

        console.log('Both players finished, determining winner:', winner);

        await supabase
          .from('matches')
          .update({
            status: 'completed',
            winner_wallet: winner,
            completed_at: new Date().toISOString()
          })
          .eq('id', matchId);

        toast({
          title: winner === walletAddress ? "🎉 Victory!" : "💀 Defeat",
          description: `Final scores: ${result1.score} vs ${result2.score}`,
        });
      }

      return data;
    } catch (error) {
      console.error('Error submitting tap result:', error);
      toast({
        title: "Error",
        description: "Failed to submit result",
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

    // Subscribe to real-time updates
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
          fetchMatches();
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
