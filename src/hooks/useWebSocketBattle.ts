
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface BattleState {
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  playerCount: number;
  countdownTime: number;
  gameTime: number;
  playerTaps: Record<string, number>;
  scores?: Array<{ wallet: string; score: number }>;
  winner?: string;
}

export const useWebSocketBattle = (matchId: string, walletAddress: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [battleState, setBattleState] = useState<BattleState>({
    gameState: 'waiting',
    playerCount: 0,
    countdownTime: 0,
    gameTime: 0,
    playerTaps: {}
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to WebSocket...');
    const wsUrl = `wss://mfwavjbqiggjqxclauae.supabase.co/functions/v1/websocket-battle?matchId=${matchId}&wallet=${walletAddress}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      
      // Clear any reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      
      // Only attempt to reconnect if not finished and not a normal closure
      if (battleState.gameState !== 'finished' && event.code !== 1000) {
        console.log('Attempting to reconnect in 3 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [matchId, walletAddress, battleState.gameState]);

  const handleMessage = (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'player_joined':
        setBattleState(prev => ({
          ...prev,
          playerCount: message.playerCount,
          gameState: message.gameState
        }));
        
        if (message.wallet !== walletAddress) {
          toast({
            title: "🎮 Player Joined!",
            description: "Battle starting soon...",
          });
        }
        break;

      case 'countdown_start':
        console.log('Countdown starting...');
        startCountdownTimer(message.startTime, message.duration);
        break;

      case 'game_start':
        console.log('Game starting...');
        startGameTimer(message.startTime, message.duration);
        break;

      case 'tap_update':
        setBattleState(prev => ({
          ...prev,
          playerTaps: {
            ...prev.playerTaps,
            [message.wallet]: message.taps
          }
        }));
        break;

      case 'game_end':
        console.log('Game ended:', message);
        setBattleState(prev => ({
          ...prev,
          gameState: 'finished',
          scores: message.scores,
          winner: message.winner
        }));
        
        clearTimers();
        
        const isWinner = message.winner === walletAddress;
        const finalScores = message.scores || [];
        const scoreText = finalScores.map((s: any) => s.score).join(' vs ');
        
        toast({
          title: isWinner ? "🎉 Victory!" : "💀 Defeat",
          description: `Final scores: ${scoreText}`,
        });
        break;

      case 'player_left':
        setBattleState(prev => ({
          ...prev,
          playerCount: message.playerCount
        }));
        
        toast({
          title: "⚠️ Player Left",
          description: "Opponent disconnected",
          variant: "destructive"
        });
        break;
    }
  };

  const startCountdownTimer = (startTime: number, duration: number) => {
    setBattleState(prev => ({ ...prev, gameState: 'countdown' }));
    
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      setBattleState(prev => ({ ...prev, countdownTime: remaining }));
      
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 100);
  };

  const startGameTimer = (startTime: number, duration: number) => {
    setBattleState(prev => ({ 
      ...prev, 
      gameState: 'active',
      countdownTime: 0,
      playerTaps: {} // Reset taps for new game
    }));
    
    gameTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      setBattleState(prev => ({ ...prev, gameTime: remaining }));
      
      if (remaining <= 0) {
        clearInterval(gameTimerRef.current);
        sendMessage({ type: 'game_complete' });
      }
    }, 100);
  };

  const clearTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  };

  const sendTap = () => {
    if (battleState.gameState === 'active' && isConnected) {
      sendMessage({ type: 'tap' });
      
      // Optimistically update local tap count for immediate feedback
      setBattleState(prev => ({
        ...prev,
        playerTaps: {
          ...prev.playerTaps,
          [walletAddress]: (prev.playerTaps[walletAddress] || 0) + 1
        }
      }));
    }
  };

  const disconnect = () => {
    console.log('Manually disconnecting WebSocket...');
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
    setIsConnected(false);
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect]);

  return {
    isConnected,
    battleState,
    sendTap,
    disconnect
  };
};
