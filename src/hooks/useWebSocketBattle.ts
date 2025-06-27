
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      toast({
        title: "Connection Failed",
        description: "Unable to establish WebSocket connection",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log(`Connecting to WebSocket (attempt ${reconnectAttemptsRef.current + 1})...`);
      
      // Construct WebSocket URL with proper authentication
      const wsUrl = new URL('wss://mfwavjbqiggjqxclauae.supabase.co/functions/v1/websocket-battle');
      wsUrl.searchParams.set('matchId', matchId);
      wsUrl.searchParams.set('wallet', walletAddress);
      
      // Add authentication if available
      if (session?.access_token) {
        wsUrl.searchParams.set('authorization', `Bearer ${session.access_token}`);
      }

      wsRef.current = new WebSocket(wsUrl.toString());

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Send initial connection message
        sendMessage({ 
          type: 'join_match', 
          matchId, 
          wallet: walletAddress 
        });
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
        
        // Only attempt to reconnect if:
        // 1. Game is not finished
        // 2. Close code indicates an error (not normal closure)
        // 3. We haven't exceeded max attempts
        if (battleState.gameState !== 'finished' && 
            event.code !== 1000 && 
            reconnectAttemptsRef.current < maxReconnectAttempts) {
          
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 5000);
          
          console.log(`Attempting to reconnect in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [matchId, walletAddress, battleState.gameState, toast]);

  const handleMessage = (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'player_joined':
        setBattleState(prev => ({
          ...prev,
          playerCount: message.playerCount,
          gameState: message.gameState || prev.gameState
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

      case 'error':
        console.error('WebSocket error message:', message);
        toast({
          title: "Connection Error",
          description: message.message || "WebSocket connection error",
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
      playerTaps: {}
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
    console.log('Manually disconnecting WebSocket...');
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = maxReconnectAttempts;
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
