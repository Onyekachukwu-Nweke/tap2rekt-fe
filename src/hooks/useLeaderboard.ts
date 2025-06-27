
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  wallet_address: string;
  total_battles: number;
  total_victories: number;
  best_tap_count: number;
  win_rate: number;
  display_name: string;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .order('total_victories', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData: LeaderboardEntry[] = (data || []).map(player => ({
        wallet_address: player.wallet_address,
        total_battles: player.total_battles,
        total_victories: player.total_victories,
        best_tap_count: player.best_tap_count,
        win_rate: player.total_battles > 0 ? Math.round((player.total_victories / player.total_battles) * 100) : 0,
        display_name: `${player.wallet_address.slice(0, 6)}...${player.wallet_address.slice(-4)}`
      }));

      setLeaderboard(formattedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopPlayersByTaps = async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .order('best_tap_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(player => ({
        wallet_address: player.wallet_address,
        total_battles: player.total_battles,
        total_victories: player.total_victories,
        best_tap_count: player.best_tap_count,
        win_rate: player.total_battles > 0 ? Math.round((player.total_victories / player.total_battles) * 100) : 0,
        display_name: `${player.wallet_address.slice(0, 6)}...${player.wallet_address.slice(-4)}`
      }));
    } catch (error) {
      console.error('Error fetching top players by taps:', error);
      return [];
    }
  };

  const getTopPlayersByWinRate = async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .gte('total_battles', 3) // Only include players with at least 3 battles
        .order('total_victories', { ascending: false })
        .limit(limit * 2); // Get more data to calculate win rate

      if (error) throw error;

      const formattedData = (data || []).map(player => ({
        wallet_address: player.wallet_address,
        total_battles: player.total_battles,
        total_victories: player.total_victories,
        best_tap_count: player.best_tap_count,
        win_rate: player.total_battles > 0 ? Math.round((player.total_victories / player.total_battles) * 100) : 0,
        display_name: `${player.wallet_address.slice(0, 6)}...${player.wallet_address.slice(-4)}`
      }));

      // Sort by win rate and limit
      return formattedData
        .sort((a, b) => b.win_rate - a.win_rate)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top players by win rate:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    refetch: fetchLeaderboard,
    getTopPlayersByTaps,
    getTopPlayersByWinRate
  };
};
