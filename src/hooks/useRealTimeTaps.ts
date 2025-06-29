
import { useState, useEffect, useCallback } from 'react';
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

  // Send real-time tap update immediately (no throttling for real-time feel)
  const sendTapUpdate = useCallback(async (tapCount: number) => {
    try {
      const channel = supabase.channel(`match-taps-${matchId}`);
      await channel.send({
        type: 'broadcast',
        event: 'tap_update',
        payload: {
          wallet: walletAddress,
          taps: tapCount,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to send tap update:', error);
    }
  }, [matchId, walletAddress]);

  // Send final score when game ends
  const sendFinalScore = useCallback(async (finalScore: number) => {
    try {
      const channel = supabase.channel(`match-taps-${matchId}`);
      await channel.send({
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
  }, [matchId, walletAddress]);

  useEffect(() => {
    if (!matchId || !walletAddress) return;

    // Create a single channel for this match
    const channel = supabase
      .channel(`match-taps-${matchId}`)
      .on('broadcast', { event: 'tap_update' }, (payload) => {
        const { wallet, taps } = payload.payload;
        
        setState(prev => ({
          ...prev,
          playerTaps: {
            ...prev.playerTaps,
            [wallet]: taps
          }
        }));
      })
      .on('broadcast', { event: 'final_score_update' }, (payload) => {
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
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED'
        }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, walletAddress]);

  return {
    playerTaps: state.playerTaps,
    isConnected: state.isConnected,
    sendTapUpdate,
    sendFinalScore
  };
};
