
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMatches } from './useMatches';
import { useWagerSystem } from './useWagerSystem';
import { useTokenTransfer } from './useTokenTransfer';
import { supabase } from '@/integrations/supabase/client';

interface MatchLobbyState {
  match: any;
  balance: number;
  wagerStatus: any;
  loading: boolean;
  error: string | null;
}

export const useMatchLobby = (matchId: string, walletAddress: string) => {
  const [state, setState] = useState<MatchLobbyState>({
    match: null,
    balance: 0,
    wagerStatus: null,
    loading: true,
    error: null
  });
  
  const { getMatch } = useMatches();
  const { checkWagerStatus } = useWagerSystem();
  const { getTokenBalance } = useTokenTransfer();
  
  // Refs to prevent multiple simultaneous calls
  const loadingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  const balanceCache = useRef<{ value: number; timestamp: number } | null>(null);
  
  // Debounced update function
  const updateState = useCallback(async (force = false) => {
    if (loadingRef.current && !force) return;
    
    const now = Date.now();
    // Prevent updates more frequently than every 2 seconds unless forced
    if (now - lastUpdateRef.current < 2000 && !force) return;
    
    loadingRef.current = true;
    lastUpdateRef.current = now;
    
    try {
      // Get match data
      const matchData = await getMatch(matchId);
      if (!matchData) {
        setState(prev => ({ ...prev, error: 'Match not found', loading: false }));
        return;
      }

      // Check if we need to update balance (cache for 30 seconds during waiting)
      let balance = 0;
      if (matchData.status === 'waiting') {
        if (balanceCache.current && now - balanceCache.current.timestamp < 30000) {
          balance = balanceCache.current.value;
        } else {
          balance = await getTokenBalance();
          balanceCache.current = { value: balance, timestamp: now };
        }
      } else {
        balance = await getTokenBalance();
      }

      // Get wager status
      const wagerStatus = await checkWagerStatus(matchId);

      setState({
        match: matchData,
        balance,
        wagerStatus,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error updating match lobby state:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Update failed',
        loading: false 
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [matchId, getMatch, checkWagerStatus, getTokenBalance]);

  // Initial load
  useEffect(() => {
    updateState(true);
  }, [updateState]);

  // Real-time subscription with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const channel = supabase
      .channel(`match-lobby-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        () => {
          // Debounce updates by 2 seconds
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            updateState(true);
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [matchId, updateState]);

  const refetch = useCallback(() => {
    // Clear cache and force update
    balanceCache.current = null;
    updateState(true);
  }, [updateState]);

  return {
    ...state,
    refetch
  };
};
