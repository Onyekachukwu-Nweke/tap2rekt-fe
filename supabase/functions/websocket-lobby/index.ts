
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface LobbyState {
  matchId: string;
  players: Map<string, WebSocket>;
  deposits: Map<string, boolean>;
  matchStatus: string;
}

const lobbies = new Map<string, LobbyState>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  const walletAddress = url.searchParams.get("wallet");

  if (!matchId || !walletAddress) {
    return new Response("Missing matchId or wallet", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Lobby WebSocket connection for match ${matchId}, wallet ${walletAddress}`);

  const { socket, response } = Deno.upgradeWebSocket(req, { headers: corsHeaders });

  socket.onopen = async () => {
    console.log(`Player ${walletAddress} connected to lobby ${matchId}`);
    
    try {
      // Initialize lobby state if not exists
      if (!lobbies.has(matchId)) {
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        lobbies.set(matchId, {
          matchId,
          players: new Map(),
          deposits: new Map(),
          matchStatus: match?.status || 'waiting'
        });
      }

      const lobby = lobbies.get(matchId)!;
      lobby.players.set(walletAddress, socket);

      // Send current lobby state
      broadcastToLobby(matchId, {
        type: 'lobby_update',
        playerCount: lobby.players.size,
        status: lobby.matchStatus,
        deposits: Object.fromEntries(lobby.deposits)
      });

      // Check for match updates every 30 seconds (much less frequent than before)
      const checkInterval = setInterval(async () => {
        if (lobby.players.has(walletAddress)) {
          await checkMatchStatus(matchId);
        } else {
          clearInterval(checkInterval);
        }
      }, 30000);

    } catch (error) {
      console.error('Error handling lobby connection:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to join lobby'
      }));
    }
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      await handleLobbyMessage(matchId, walletAddress, message);
    } catch (error) {
      console.error('Error handling lobby message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`Player ${walletAddress} disconnected from lobby ${matchId}`);
    const lobby = lobbies.get(matchId);
    if (lobby) {
      lobby.players.delete(walletAddress);
      
      if (lobby.players.size === 0) {
        console.log(`Cleaning up empty lobby: ${matchId}`);
        lobbies.delete(matchId);
      } else {
        broadcastToLobby(matchId, {
          type: 'lobby_update',
          playerCount: lobby.players.size
        });
      }
    }
  };

  return response;
});

async function handleLobbyMessage(matchId: string, walletAddress: string, message: any) {
  const lobby = lobbies.get(matchId);
  if (!lobby) return;

  switch (message.type) {
    case 'deposit_made':
      // Mark deposit as confirmed
      lobby.deposits.set(walletAddress, true);
      
      broadcastToLobby(matchId, {
        type: 'deposit_confirmed',
        wallet: walletAddress,
        role: message.role
      });

      // Check if both deposits are in
      const depositCount = Array.from(lobby.deposits.values()).filter(Boolean).length;
      if (depositCount >= 2) {
        broadcastToLobby(matchId, {
          type: 'match_ready'
        });
      }
      break;
  }
}

async function checkMatchStatus(matchId: string) {
  const lobby = lobbies.get(matchId);
  if (!lobby) return;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (match && match.status !== lobby.matchStatus) {
      lobby.matchStatus = match.status;
      
      broadcastToLobby(matchId, {
        type: 'lobby_update',
        status: match.status,
        playerCount: lobby.players.size
      });
    }
  } catch (error) {
    console.error('Error checking match status:', error);
  }
}

function broadcastToLobby(matchId: string, message: any) {
  const lobby = lobbies.get(matchId);
  if (!lobby) return;

  const messageStr = JSON.stringify(message);
  console.log(`Broadcasting to lobby ${matchId}:`, message.type);
  
  const playersCopy = new Map(lobby.players);
  
  for (const [wallet, socket] of playersCopy) {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
      } else {
        console.warn(`Removing disconnected socket for wallet ${wallet}`);
        lobby.players.delete(wallet);
      }
    } catch (error) {
      console.error(`Error sending message to ${wallet}:`, error);
      lobby.players.delete(wallet);
    }
  }
}
