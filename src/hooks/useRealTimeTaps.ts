
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeTapsState {
  playerTaps: Record<string, number>;
  isConnected: boolean;
}

export const useRealTimeTaps = (matchId: string, walletAddress: string) => {
  const [state, setState] = useState<RealTimeTapsState>({
    playerTaps: {},
    isConnected: false
  });

  const channelRef = useRef<any>(null);
  const lastTapRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Throttled tap update to prevent spam
  const sendTapUpdate = useCallback(async (tapCount: number) => {
    if (!channelRef.current || !mountedRef.current) return;
    
    const now = Date.now();
    // Throttle tap updates to max 10 per second
    if (now - lastTapRef.current < 100) return;
    
    lastTapRef.current = now;

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'tap_update',
        payload: {
          wallet: walletAddress,
          taps: tapCount,
          timestamp: now
        }
      });
    } catch (error) {
      console.error('Failed to send tap update:', error);
    }
  }, [walletAddress]);

  // Send final score when game ends
  const sendFinalScore = useCallback(async (finalScore: number) => {
    if (!channelRef.current || !mountedRef.current) return;

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'final_score_update',
        payload: {
          wallet: walletAddress,
          finalScore: finalScore,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to send final score update:', error);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!matchId || !walletAddress || !mountedRef.current) return;

    // Create a single channel for this match
    const channel = supabase
      .channel(`match-taps-${matchId}`)
      .on('broadcast', { event: 'tap_update' }, (payload) => {
        if (!mountedRef.current) return;
        
        const { wallet, taps } = payload.payload;
        
        setState(prev => {
          // Only update if the tap count actually changed
          if (prev.playerTaps[wallet] === taps) return prev;
          
          return {
            ...prev,
            playerTaps: {
              ...prev.playerTaps,
              [wallet]: taps
            }
          };
        });
      })
      .on('broadcast', { event: 'final_score_update' }, (payload) => {
        if (!mountedRef.current) return;
        
        const { wallet, finalScore } = payload.payload;
        
        setState(prev => ({
          ...prev,
          playerTaps: {
            ...prev.playerTaps,
            [wallet]: finalScore
          }
        }));
      })
      .subscribe((status) => {
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            isConnected: status === 'SUBSCRIBED'
          }));
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId, walletAddress]);

  return {
    playerTaps: state.playerTaps,
    isConnected: state.isConnected,
    sendTapUpdate,
    sendFinalScore
  };
};
