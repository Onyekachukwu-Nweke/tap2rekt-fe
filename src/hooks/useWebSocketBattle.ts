
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
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const clearIntervals = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    console.log(`Connecting to battle WebSocket for match ${matchId}`);
    const socket = io(import.meta.env.VITE_WS_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Battle WebSocket connected');
      setIsConnected(true);
      
      // Join the match room
      socket.emit('join_match', { matchId, wallet: walletAddress });
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socket.on('disconnect', () => {
      console.log('Battle WebSocket disconnected');
      setIsConnected(false);
      clearIntervals();
      
      // Auto-reconnect after 3 seconds if not manually disconnected
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect battle WebSocket...');
          connect();
        }, 3000);
      }
    });

    // Listen for unified 'update' events from your server
    socket.on('update', (data) => {
      console.log('Battle update received:', data);
      
      switch (data.type) {
        case 'player_joined':
          setBattleState(prev => ({
            ...prev,
            playerCount: data.playerCount
          }));
          
          // Auto-start countdown when we have 2 players
          if (data.playerCount === 2) {
            console.log('2 players connected, starting countdown...');
            setTimeout(() => {
              setBattleState(prev => ({
                ...prev,
                gameState: 'countdown',
                countdownTime: 3
              }));
              
              // Start countdown timer
              clearIntervals();
              countdownIntervalRef.current = setInterval(() => {
                setBattleState(prev => {
                  const newTime = prev.countdownTime - 1;
                  console.log('Countdown:', newTime);
                  
                  if (newTime <= 0) {
                    clearInterval(countdownIntervalRef.current!);
                    countdownIntervalRef.current = null;
                    
                    // Start the game
                    setBattleState(gameState => ({
                      ...gameState,
                      gameState: 'active',
                      gameTime: 30
                    }));
                    
                    // Start game timer
                    gameIntervalRef.current = setInterval(() => {
                      setBattleState(gameState => {
                        const newGameTime = gameState.gameTime - 1;
                        console.log('Game time:', newGameTime);
                        
                        if (newGameTime <= 0) {
                          clearInterval(gameIntervalRef.current!);
                          gameIntervalRef.current = null;
                          
                          // End the game
                          return {
                            ...gameState,
                            gameState: 'finished',
                            gameTime: 0
                          };
                        }
                        return { ...gameState, gameTime: newGameTime };
                      });
                    }, 1000);
                    
                    return { ...prev, countdownTime: 0 };
                  }
                  return { ...prev, countdownTime: newTime };
                });
              }, 1000);
            }, 1000); // Small delay to ensure UI updates
          }
          break;
          
        case 'countdown_start':
          clearIntervals();
          setBattleState(prev => ({
            ...prev,
            gameState: 'countdown',
            countdownTime: data.countdownTime || 3
          }));
          
          // Handle countdown timer
          countdownIntervalRef.current = setInterval(() => {
            setBattleState(prev => {
              const newTime = prev.countdownTime - 1;
              if (newTime <= 0) {
                clearInterval(countdownIntervalRef.current!);
                countdownIntervalRef.current = null;
                return { ...prev, countdownTime: 0 };
              }
              return { ...prev, countdownTime: newTime };
            });
          }, 1000);
          break;
          
        case 'game_start':
          clearIntervals();
          setBattleState(prev => ({
            ...prev,
            gameState: 'active',
            gameTime: data.gameTime || 30
          }));
          
          // Handle game timer
          gameIntervalRef.current = setInterval(() => {
            setBattleState(prev => {
              const newTime = prev.gameTime - 1;
              if (newTime <= 0) {
                clearInterval(gameIntervalRef.current!);
                gameIntervalRef.current = null;
                return { ...prev, gameTime: 0, gameState: 'finished' };
              }
              return { ...prev, gameTime: newTime };
            });
          }, 1000);
          break;
          
        case 'tap_update':
          setBattleState(prev => ({
            ...prev,
            playerTaps: { ...prev.playerTaps, [data.wallet]: data.taps }
          }));
          break;
          
        case 'game_end':
          clearIntervals();
          setBattleState(prev => ({
            ...prev,
            gameState: 'finished',
            winner: data.winner,
            scores: data.scores
          }));
          break;
      }
    });

    socket.on('error', (error) => {
      console.error('Battle WebSocket error:', error);
      toast({
        title: "⚠️ Connection Error",
        description: "Battle connection lost, attempting to reconnect...",
        variant: "destructive"
      });
    });

  }, [matchId, walletAddress, toast, clearIntervals]);

  useEffect(() => {
    connect();

    return () => {
      clearIntervals();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect, clearIntervals]);

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
    clearIntervals();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, [clearIntervals]);

  return {
    isConnected,
    battleState,
    sendTap,
    disconnect
  };
};
