
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BattleState {
  matchId: string;
  players: Map<string, WebSocket>;
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  countdownStart?: number;
  gameStart?: number;
  playerTaps: Map<string, number>;
  countdownTimer?: number;
  gameTimer?: number;
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

  if (!matchId || !walletAddress) {
    return new Response("Missing matchId or wallet", { 
      status: 400,
      headers: corsHeaders 
    });
  }

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

      // Start countdown immediately when we have 2 players
      if (battle.players.size === 2 && battle.gameState === 'waiting') {
        console.log(`Starting countdown for match ${matchId} - both players connected`);
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
    }
  };

  socket.onclose = () => {
    console.log(`Player ${walletAddress} disconnected from match ${matchId}`);
    const battle = battles.get(matchId);
    if (battle) {
      battle.players.delete(walletAddress);
      battle.playerTaps.delete(walletAddress);
      
      // Clean up timers if needed
      if (battle.countdownTimer) {
        clearTimeout(battle.countdownTimer);
      }
      if (battle.gameTimer) {
        clearTimeout(battle.gameTimer);
      }
      
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
  }
}

function startCountdown(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle || battle.players.size < 2) {
    console.error(`Cannot start countdown for battle ${matchId}: insufficient players`);
    return;
  }

  console.log(`Starting synchronized countdown for battle ${matchId}`);
  battle.gameState = 'countdown';
  battle.countdownStart = Date.now();
  
  // Broadcast countdown start to all players simultaneously
  broadcastToMatch(matchId, {
    type: 'countdown_start',
    startTime: battle.countdownStart,
    duration: 3000
  });

  // Set timer for game start
  battle.countdownTimer = setTimeout(() => {
    startGame(matchId);
  }, 3000);
}

function startGame(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Battle not found when starting game: ${matchId}`);
    return;
  }

  console.log(`Starting synchronized game for battle ${matchId}`);
  battle.gameState = 'active';
  battle.gameStart = Date.now();
  
  // Reset all player taps
  for (const wallet of battle.players.keys()) {
    battle.playerTaps.set(wallet, 0);
  }

  // Broadcast game start to all players simultaneously
  broadcastToMatch(matchId, {
    type: 'game_start',
    startTime: battle.gameStart,
    duration: 30000
  });

  // Set timer for game end
  battle.gameTimer = setTimeout(() => {
    endGame(matchId);
  }, 30000);
}

function endGame(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Battle not found when ending game: ${matchId}`);
    return;
  }

  console.log(`Ending synchronized game for battle ${matchId}`);
  battle.gameState = 'finished';
  
  const scores = Array.from(battle.playerTaps.entries()).map(([wallet, taps]) => ({
    wallet,
    score: taps
  }));
  
  console.log(`Final scores for ${matchId}:`, scores);
  
  const winner = scores.reduce((prev, current) => 
    prev.score > current.score ? prev : current
  );

  // Broadcast game end to all players simultaneously
  broadcastToMatch(matchId, {
    type: 'game_end',
    scores,
    winner: winner.wallet,
    timestamp: Date.now()
  });

  // Clean up after 30 seconds
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
  console.log(`Broadcasting to match ${matchId}:`, message.type, `(${battle.players.size} players)`);
  
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
