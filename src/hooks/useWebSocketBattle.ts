
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { io, Socket } from "socket.io-client";

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
  
  const socketRef = useRef<Socket | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket.io already connected');
      return;
    }
  
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      toast({
        title: "Connection Failed",
        description: "Unable to establish Socket.io connection",
        variant: "destructive"
      });
      return;
    }
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
  
      const socket = io(process.env.VITE_WS_URL, {
        transports: ["websocket"],
        auth: { token },
        query: { matchId, wallet: walletAddress }
      });
  
      socketRef.current = socket;
  
      socket.on("connect", () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        socket.emit("join_match", { matchId, wallet: walletAddress });
      });
  
      socket.on("update", (message: any) => {
        handleMessage(message);
      });
  
      socket.on("disconnect", (reason: string) => {
        setIsConnected(false);
        if (battleState.gameState !== 'finished' && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 5000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      });
  
      socket.on("connect_error", (error: any) => {
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: error.message || "Socket.io connection error",
          variant: "destructive"
        });
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: (error as Error).message || "Socket.io connection error",
        variant: "destructive"
      });
    }
  }, [matchId, walletAddress]);

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
    if (socketRef.current && socketRef.current.connected) {
      if (message.type === "tap") {
        socketRef.current.emit("tap", { matchId, wallet: walletAddress });
      } else {
        socketRef.current.emit(message.type, { ...message, matchId, wallet: walletAddress });
      }
    } else {
      console.warn('Socket.io not connected, message not sent:', message);
    }
  };
  
  const sendTap = () => {
    if (battleState.gameState === 'active' && isConnected) {
      sendMessage({ type: 'tap' });
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
    if (socketRef.current) {
      socketRef.current.disconnect();
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
