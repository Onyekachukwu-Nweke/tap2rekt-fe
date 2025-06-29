import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";

interface LobbyState {
  playerCount: number;
  deposits: { creator: boolean; opponent: boolean };
  matchStatus: string;
  matchId?: string; // Add this to track when match is ready
  lastUpdate: number;
}

export const useMatchLobbyWebSocket = (lobbyId: string, wallet: string, role: "creator" | "opponent") => {
  const [isConnected, setIsConnected] = useState(false);
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    playerCount: 0,
    deposits: { creator: false, opponent: false },
    matchStatus: "waiting",
    lastUpdate: Date.now()
  });
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log('Lobby WebSocket connected for:', wallet);
      setIsConnected(true);
      socket.emit("join_lobby", { lobbyId, wallet, role });
    });

    socket.on("lobby_update", (msg) => {
      console.log('Lobby update received:', msg);
      setLobbyState((prev) => ({
        ...prev,
        playerCount: msg.playerCount,
        matchStatus: msg.status,
        lastUpdate: Date.now()
      }));
    });

    socket.on("player_joined", (msg) => {
      console.log('Player joined lobby:', msg);
      setLobbyState((prev) => ({
        ...prev,
        playerCount: msg.playerCount,
        lastUpdate: Date.now()
      }));
      if (msg.wallet !== wallet) {
        toast({ title: "🎮 Player Joined!", description: "Opponent has joined the battle" });
      }
    });

    socket.on("deposit_confirmed", (msg) => {
      console.log('Deposit confirmed in lobby:', msg);
      setLobbyState((prev) => ({
        ...prev,
        deposits: { ...prev.deposits, [msg.role]: true },
        lastUpdate: Date.now()
      }));
      toast({ title: "💰 Deposit Confirmed!", description: `${msg.role} deposit received` });
    });

    // CRITICAL FIX: Handle match_ready event properly
    socket.on("match_ready", (msg) => {
      console.log('Match ready - both deposits confirmed!', msg);
      setLobbyState((prev) => ({
        ...prev,
        matchStatus: 'match_ready', // Change status to indicate match is ready
        matchId: msg.matchId, // Store the match ID
        lastUpdate: Date.now()
      }));
      toast({ 
        title: "⚡ Match Ready!", 
        description: "Both deposits confirmed - battle starting soon!" 
      });
    });

    socket.on("disconnect", () => {
      console.log('Lobby WebSocket disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [lobbyId, wallet, role, toast]);

  const sendMessage = (type: string, payload: any) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Sending lobby WebSocket message:', type, payload);
      socketRef.current.emit(type, payload);
    } else {
      console.warn('Lobby WebSocket not connected, message not sent:', type, payload);
    }
  };

  const notifyDeposit = () => {
    sendMessage("deposit_made", { lobbyId, wallet });
  };

  return { 
    isConnected, 
    lobbyState, 
    sendMessage, 
    notifyDeposit 
  };
};