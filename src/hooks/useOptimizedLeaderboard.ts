
import { useState, useEffect, useMemo } from 'react';
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

type SortType = 'victories' | 'taps' | 'winRate';

export const useOptimizedLeaderboard = () => {
  const [allData, setAllData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortType>('victories');
  const { toast } = useToast();

  // Memoized sorted data to avoid recalculation
  const sortedData = useMemo(() => {
    if (!allData.length) return [];
    
    const sorted = [...allData].sort((a, b) => {
      switch (currentSort) {
        case 'victories':
          return b.total_victories - a.total_victories;
        case 'taps':
          return b.best_tap_count - a.best_tap_count;
        case 'winRate':
          return b.win_rate - a.win_rate;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [allData, currentSort]);

  // Optimized single query with calculated win rates
  const fetchOptimizedLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .order('total_victories', { ascending: false })
        .limit(100); // Limit initial data load

      if (error) throw error;

      const formattedData: LeaderboardEntry[] = (data || []).map(player => ({
        wallet_address: player.wallet_address,
        total_battles: player.total_battles,
        total_victories: player.total_victories,
        best_tap_count: player.best_tap_count,
        win_rate: player.total_battles > 0 ? Math.round((player.total_victories / player.total_battles) * 100) : 0,
        display_name: `${player.wallet_address.slice(0, 6)}...${player.wallet_address.slice(-4)}`
      }));

      setAllData(formattedData);
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

  const changeSort = (sortType: SortType) => {
    setCurrentSort(sortType);
  };

  useEffect(() => {
    fetchOptimizedLeaderboard();
  }, []);

  return {
    leaderboard: sortedData,
    loading,
    currentSort,
    refetch: fetchOptimizedLeaderboard,
    changeSort
  };
};
