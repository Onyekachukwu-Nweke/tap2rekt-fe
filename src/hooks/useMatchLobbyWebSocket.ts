
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LobbyState {
  playerCount: number;
  deposits: {
    creator: boolean;
    opponent: boolean;
  };
  matchStatus: string;
  lastUpdate: number;
}

export const useMatchLobbyWebSocket = (matchId: string, walletAddress: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    playerCount: 0,
    deposits: { creator: false, opponent: false },
    matchStatus: 'waiting',
    lastUpdate: Date.now()
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached for lobby WebSocket');
      return;
    }

    try {
      const wsUrl = `wss://mfwavjbqiggjqxclauae.supabase.co/functions/v1/websocket-lobby?matchId=${matchId}&wallet=${walletAddress}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Lobby WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing lobby WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Lobby WebSocket disconnected');
        setIsConnected(false);
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 5000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('Lobby WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create lobby WebSocket:', error);
    }
  }, [matchId, walletAddress]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'lobby_update':
        setLobbyState(prev => ({
          ...prev,
          playerCount: message.playerCount || prev.playerCount,
          matchStatus: message.status || prev.matchStatus,
          lastUpdate: Date.now()
        }));
        break;
        
      case 'deposit_confirmed':
        setLobbyState(prev => ({
          ...prev,
          deposits: {
            ...prev.deposits,
            [message.role]: true
          },
          lastUpdate: Date.now()
        }));
        
        toast({
          title: "💰 Deposit Confirmed!",
          description: `${message.role === 'creator' ? 'Creator' : 'Opponent'} deposit received`,
        });
        break;
        
      case 'match_ready':
        toast({
          title: "⚡ Match Ready!",
          description: "Both deposits confirmed - starting battle!",
        });
        break;
        
      case 'player_joined':
        setLobbyState(prev => ({
          ...prev,
          playerCount: message.playerCount,
          lastUpdate: Date.now()
        }));
        
        if (message.wallet !== walletAddress) {
          toast({
            title: "🎮 Player Joined!",
            description: "Opponent has joined the battle",
          });
        }
        break;
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = maxReconnectAttempts;
  };

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect]);

  return {
    isConnected,
    lobbyState,
    sendMessage,
    disconnect
  };
};
