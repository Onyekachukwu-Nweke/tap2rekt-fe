
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
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://mfwavjbqiggjqxclauae.supabase.co/functions/v1/websocket-battle?matchId=${matchId}&wallet=${walletAddress}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (battleState.gameState !== 'finished') {
          connect();
        }
      }, 3000);
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
        startCountdownTimer(message.startTime, message.duration);
        break;

      case 'game_start':
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
        setBattleState(prev => ({
          ...prev,
          gameState: 'finished',
          scores: message.scores,
          winner: message.winner
        }));
        
        clearTimers();
        
        const isWinner = message.winner === walletAddress;
        toast({
          title: isWinner ? "🎉 Victory!" : "💀 Defeat",
          description: `Final scores: ${message.scores.map((s: any) => s.score).join(' vs ')}`,
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
      playerTaps: {} // Reset taps
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
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const sendTap = () => {
    if (battleState.gameState === 'active') {
      sendMessage({ type: 'tap' });
      
      // Optimistically update local tap count
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
    clearTimers();
    wsRef.current?.close();
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
