
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  creator_wallet: string;
  opponent_wallet: string | null;
  wager: number;
  status: string;
  winner_wallet: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
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

  const createMatch = async (walletAddress: string, wager: number) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          creator_wallet: walletAddress,
          wager: wager,
          status: 'waiting'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎮 Battle Created!",
        description: `Created battle with ${wager} GORB wager`,
      });

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
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "⚡ Battle Joined!",
        description: "Get ready to tap!",
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
    refetch: fetchMatches
  };
};
