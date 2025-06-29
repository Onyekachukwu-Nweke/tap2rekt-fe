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
  
  // Prevent multiple simultaneous calls
  const updateInProgressRef = useRef(false);
  const mountedRef = useRef(true);
  const lastUpdateRef = useRef(0);
  const stateRef = useRef(state);
  
  // Keep state ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Optimized update function with better debouncing
  const updateState = useCallback(async (force = false) => {
    if (!mountedRef.current || !matchId || !walletAddress) return;
    
    const now = Date.now();
    
    // Prevent updates more frequently than every 5 seconds unless forced
    if (!force && (updateInProgressRef.current || now - lastUpdateRef.current < 5000)) {
      return;
    }
    
    updateInProgressRef.current = true;
    lastUpdateRef.current = now;
    
    try {
      // Get match data
      const matchData = await getMatch(matchId);
      if (!mountedRef.current) return;
      
      if (!matchData) {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, error: 'Match not found', loading: false }));
        }
        return;
      }

      // Only get balance if really needed (match is waiting)
      let balance = stateRef.current.balance;
      if (matchData.status === 'waiting') {
        balance = await getTokenBalance();
        if (!mountedRef.current) return;
      }

      // Get wager status
      const wagerStatus = await checkWagerStatus(matchId);
      if (!mountedRef.current) return;

      // Only update state if something actually changed
      const newState = {
        match: matchData,
        balance,
        wagerStatus,
        loading: false,
        error: null
      };

      // Deep comparison to prevent unnecessary re-renders
      const stateChanged = 
        JSON.stringify(stateRef.current.match) !== JSON.stringify(newState.match) ||
        stateRef.current.balance !== newState.balance ||
        JSON.stringify(stateRef.current.wagerStatus) !== JSON.stringify(newState.wagerStatus) ||
        stateRef.current.loading !== newState.loading ||
        stateRef.current.error !== newState.error;

      if (stateChanged && mountedRef.current) {
        setState(newState);
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
      updateInProgressRef.current = false;
    }
  }, [matchId, walletAddress, getMatch, checkWagerStatus, getTokenBalance]);

  // Initial load - only run once per matchId change
  useEffect(() => {
    if (!matchId || !walletAddress) return;
    
    let mounted = true;
    
    const initialLoad = async () => {
      if (mounted && mountedRef.current) {
        await updateState(true);
      }
    };
    
    initialLoad();
    
    return () => {
      mounted = false;
    };
  }, [matchId, walletAddress]); // Removed updateState from deps to prevent loops

  // Real-time subscription with better throttling
  useEffect(() => {
    if (!matchId) return;
    
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
          // Increased debounce to prevent excessive calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            if (mountedRef.current) {
              updateState(true);
            }
          }, 5000); // 5 second debounce
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [matchId, updateState]);

  const refetch = useCallback(() => {
    updateState(true);
  }, [updateState]);

  return {
    ...state,
    refetch
  };
};
