
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

  // Send tap update to other players
  const sendTapUpdate = useCallback(async (tapCount: number) => {
    try {
      // Broadcast tap count via Supabase Realtime
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

  useEffect(() => {
    if (!matchId || !walletAddress) return;

    // Subscribe to real-time tap updates
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
    sendTapUpdate
  };
};
