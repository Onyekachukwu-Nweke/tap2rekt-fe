
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
  
  // Prevent multiple simultaneous calls and infinite loops
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastUpdateRef = useRef(0);
  const balanceCache = useRef<{ value: number; timestamp: number } | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Stable update function with proper debouncing
  const updateState = useCallback(async (force = false) => {
    if (!mountedRef.current || (loadingRef.current && !force)) return;
    
    const now = Date.now();
    // Prevent updates more frequently than every 3 seconds unless forced
    if (!force && now - lastUpdateRef.current < 3000) return;
    
    loadingRef.current = true;
    lastUpdateRef.current = now;
    
    try {
      // Get match data
      const matchData = await getMatch(matchId);
      if (!mountedRef.current) return;
      
      if (!matchData) {
        setState(prev => ({ ...prev, error: 'Match not found', loading: false }));
        return;
      }

      // Get balance with caching for waiting matches
      let balance = 0;
      if (matchData.status === 'waiting') {
        if (balanceCache.current && now - balanceCache.current.timestamp < 30000) {
          balance = balanceCache.current.value;
        } else {
          balance = await getTokenBalance();
          if (mountedRef.current) {
            balanceCache.current = { value: balance, timestamp: now };
          }
        }
      } else {
        balance = await getTokenBalance();
      }

      if (!mountedRef.current) return;

      // Get wager status
      const wagerStatus = await checkWagerStatus(matchId);

      if (mountedRef.current) {
        setState({
          match: matchData,
          balance,
          wagerStatus,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error updating match lobby state:', error);
      if (mountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Update failed',
          loading: false 
        }));
      }
    } finally {
      loadingRef.current = false;
    }
  }, [matchId, getMatch, checkWagerStatus, getTokenBalance]);

  // Initial load only once
  useEffect(() => {
    let mounted = true;
    
    const initialLoad = async () => {
      if (mounted) {
        await updateState(true);
      }
    };
    
    initialLoad();
    
    return () => {
      mounted = false;
    };
  }, [matchId]); // Only depend on matchId, not updateState

  // Real-time subscription with better debouncing
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
          // Debounce updates by 3 seconds to prevent excessive calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            if (mountedRef.current) {
              updateState(true);
            }
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [matchId]); // Only depend on matchId

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
