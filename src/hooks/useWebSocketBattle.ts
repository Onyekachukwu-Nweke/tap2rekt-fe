
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface BattleState {
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  playerCount: number;
  playerTaps: Record<string, number>;
  gameTime: number;
  countdownTime: number;
  winner?: string;
  scores?: Array<{ wallet: string; score: number }>;
}

export const useWebSocketBattle = (matchId: string, walletAddress: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [battleState, setBattleState] = useState<BattleState>({
    gameState: 'waiting',
    playerCount: 0,
    playerTaps: {},
    gameTime: 30,
    countdownTime: 3,
  });
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    console.log(`Connecting to battle WebSocket for match ${matchId}`);
    const socket = io(`${import.meta.env.VITE_WS_URL}/websocket-battle`, {
      query: { matchId, wallet: walletAddress },
      transports: ['websocket'],
      forceNew: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Battle WebSocket connected');
      setIsConnected(true);
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socket.on('disconnect', () => {
      console.log('Battle WebSocket disconnected');
      setIsConnected(false);
      
      // Auto-reconnect after 3 seconds if not manually disconnected
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect battle WebSocket...');
          connect();
        }, 3000);
      }
    });

    socket.on('game_state_update', (data) => {
      console.log('Battle game state update:', data);
      setBattleState(prev => ({
        ...prev,
        gameState: data.state,
        playerCount: data.playerCount || prev.playerCount,
        gameTime: data.timeLeft || prev.gameTime,
        countdownTime: data.timeLeft || prev.countdownTime,
      }));
    });

    socket.on('tap_update', (data) => {
      console.log('Tap update received:', data);
      setBattleState(prev => ({
        ...prev,
        playerTaps: { ...prev.playerTaps, [data.wallet]: data.tapCount }
      }));
    });

    socket.on('game_finished', (data) => {
      console.log('Game finished:', data);
      setBattleState(prev => ({
        ...prev,
        gameState: 'finished',
        winner: data.winner,
        scores: data.scores
      }));
    });

    socket.on('error', (error) => {
      console.error('Battle WebSocket error:', error);
      toast({
        title: "⚠️ Connection Error",
        description: "Battle connection lost, attempting to reconnect...",
        variant: "destructive"
      });
    });

  }, [matchId, walletAddress, toast]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  const sendTap = useCallback(() => {
    if (socketRef.current && isConnected && battleState.gameState === 'active') {
      console.log('Sending tap');
      socketRef.current.emit('tap', { matchId, wallet: walletAddress });
      
      // Optimistically update local state
      setBattleState(prev => ({
        ...prev,
        playerTaps: {
          ...prev.playerTaps,
          [walletAddress]: (prev.playerTaps[walletAddress] || 0) + 1
        }
      }));
    }
  }, [isConnected, battleState.gameState, matchId, walletAddress]);

  const disconnect = useCallback(() => {
    console.log('Manually disconnecting battle WebSocket');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    battleState,
    sendTap,
    disconnect
  };
};
