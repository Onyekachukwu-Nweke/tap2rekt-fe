
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BattleState {
  matchId: string;
  players: Map<string, WebSocket>;
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  countdownStart?: number;
  gameStart?: number;
  playerTaps: Map<string, number>;
}

const battles = new Map<string, BattleState>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
  const authHeader = url.searchParams.get("authorization") || headers.get("authorization");

  if (!matchId || !walletAddress) {
    return new Response("Missing matchId or wallet", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  // Initialize Supabase client for potential database operations
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`WebSocket upgrade request for match ${matchId}, wallet ${walletAddress}`);

  const { socket, response } = Deno.upgradeWebSocket(req, { headers: corsHeaders });

  socket.onopen = () => {
    console.log(`Player ${walletAddress} connected to match ${matchId}`);
    
    try {
      // Initialize battle state if not exists
      if (!battles.has(matchId)) {
        battles.set(matchId, {
          matchId,
          players: new Map(),
          gameState: 'waiting',
          playerTaps: new Map()
        });
      }

      const battle = battles.get(matchId)!;
      battle.players.set(walletAddress, socket);
      battle.playerTaps.set(walletAddress, 0);

      // Notify all players about current state
      broadcastToMatch(matchId, {
        type: 'player_joined',
        wallet: walletAddress,
        playerCount: battle.players.size,
        gameState: battle.gameState
      });

      // Start countdown if we have 2 players and not already started
      if (battle.players.size === 2 && battle.gameState === 'waiting') {
        startCountdown(matchId);
      }
    } catch (error) {
      console.error('Error handling WebSocket connection:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to join battle'
      }));
    }
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleMessage(matchId, walletAddress, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  };

  socket.onclose = () => {
    console.log(`Player ${walletAddress} disconnected from match ${matchId}`);
    const battle = battles.get(matchId);
    if (battle) {
      battle.players.delete(walletAddress);
      battle.playerTaps.delete(walletAddress);
      
      if (battle.players.size === 0) {
        console.log(`Cleaning up empty battle: ${matchId}`);
        battles.delete(matchId);
      } else {
        broadcastToMatch(matchId, {
          type: 'player_left',
          wallet: walletAddress,
          playerCount: battle.players.size
        });
      }
    }
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${walletAddress}:`, error);
  };

  return response;
});

function handleMessage(matchId: string, walletAddress: string, message: any) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Battle not found: ${matchId}`);
    return;
  }

  switch (message.type) {
    case 'join_match':
      console.log(`Player ${walletAddress} joining match ${matchId}`);
      break;

    case 'tap':
      if (battle.gameState === 'active') {
        const currentTaps = battle.playerTaps.get(walletAddress) || 0;
        const newTaps = currentTaps + 1;
        battle.playerTaps.set(walletAddress, newTaps);
        
        broadcastToMatch(matchId, {
          type: 'tap_update',
          wallet: walletAddress,
          taps: newTaps,
          timestamp: Date.now()
        });
      }
      break;
      
    case 'game_complete':
      const finalScore = battle.playerTaps.get(walletAddress) || 0;
      console.log(`Player ${walletAddress} completed with score: ${finalScore}`);
      break;
  }
}

function startCountdown(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle || battle.players.size < 2) {
    console.error(`Cannot start countdown for battle ${matchId}: insufficient players`);
    return;
  }

  console.log(`Starting countdown for battle ${matchId}`);
  battle.gameState = 'countdown';
  battle.countdownStart = Date.now();
  
  broadcastToMatch(matchId, {
    type: 'countdown_start',
    startTime: battle.countdownStart,
    duration: 3000
  });

  setTimeout(() => {
    startGame(matchId);
  }, 3000);
}

function startGame(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Battle not found when starting game: ${matchId}`);
    return;
  }

  console.log(`Starting game for battle ${matchId}`);
  battle.gameState = 'active';
  battle.gameStart = Date.now();
  
  for (const wallet of battle.players.keys()) {
    battle.playerTaps.set(wallet, 0);
  }

  broadcastToMatch(matchId, {
    type: 'game_start',
    startTime: battle.gameStart,
    duration: 30000
  });

  setTimeout(() => {
    endGame(matchId);
  }, 30000);
}

function endGame(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Battle not found when ending game: ${matchId}`);
    return;
  }

  console.log(`Ending game for battle ${matchId}`);
  battle.gameState = 'finished';
  
  const scores = Array.from(battle.playerTaps.entries()).map(([wallet, taps]) => ({
    wallet,
    score: taps
  }));
  
  console.log(`Final scores for ${matchId}:`, scores);
  
  const winner = scores.reduce((prev, current) => 
    prev.score > current.score ? prev : current
  );

  broadcastToMatch(matchId, {
    type: 'game_end',
    scores,
    winner: winner.wallet,
    timestamp: Date.now()
  });

  setTimeout(() => {
    battles.delete(matchId);
    console.log(`Battle ${matchId} cleaned up`);
  }, 30000);
}

function broadcastToMatch(matchId: string, message: any) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Cannot broadcast to battle ${matchId}: battle not found`);
    return;
  }

  const messageStr = JSON.stringify(message);
  console.log(`Broadcasting to match ${matchId}:`, message.type);
  
  const playersCopy = new Map(battle.players);
  
  for (const [wallet, socket] of playersCopy) {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
      } else {
        console.warn(`Removing disconnected socket for wallet ${wallet}`);
        battle.players.delete(wallet);
        battle.playerTaps.delete(wallet);
      }
    } catch (error) {
      console.error(`Error sending message to ${wallet}:`, error);
      battle.players.delete(wallet);
      battle.playerTaps.delete(wallet);
    }
  }
}
