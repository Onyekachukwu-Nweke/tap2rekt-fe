
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface BattleState {
  matchId: string;
  players: Map<string, WebSocket>;
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  countdownStart?: number;
  gameStart?: number;
  playerTaps: Map<string, number>;
}

const battles = new Map<string, BattleState>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  const walletAddress = url.searchParams.get("wallet");

  if (!matchId || !walletAddress) {
    return new Response("Missing matchId or wallet", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log(`Player ${walletAddress} connected to match ${matchId}`);
    
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
    case 'tap':
      if (battle.gameState === 'active') {
        const currentTaps = battle.playerTaps.get(walletAddress) || 0;
        const newTaps = currentTaps + 1;
        battle.playerTaps.set(walletAddress, newTaps);
        
        // Broadcast tap update to all players
        broadcastToMatch(matchId, {
          type: 'tap_update',
          wallet: walletAddress,
          taps: newTaps,
          timestamp: Date.now()
        });
      }
      break;
      
    case 'game_complete':
      // Handle individual player completion
      const finalScore = battle.playerTaps.get(walletAddress) || 0;
      console.log(`Player ${walletAddress} completed with score: ${finalScore}`);
      
      // Check if we should end the game
      checkGameEnd(matchId);
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
    duration: 3000 // 3 seconds countdown
  });

  // Start the actual game after countdown
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
  
  // Reset tap counts for fresh start
  for (const wallet of battle.players.keys()) {
    battle.playerTaps.set(wallet, 0);
  }

  broadcastToMatch(matchId, {
    type: 'game_start',
    startTime: battle.gameStart,
    duration: 30000 // 30 seconds game duration
  });

  // End game after 30 seconds
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
  
  // Calculate final scores and winner
  const scores = Array.from(battle.playerTaps.entries()).map(([wallet, taps]) => ({
    wallet,
    score: taps
  }));
  
  console.log(`Final scores for ${matchId}:`, scores);
  
  // Determine winner (highest score wins)
  const winner = scores.reduce((prev, current) => 
    prev.score > current.score ? prev : current
  );

  broadcastToMatch(matchId, {
    type: 'game_end',
    scores,
    winner: winner.wallet,
    timestamp: Date.now()
  });

  // Clean up battle after a delay
  setTimeout(() => {
    battles.delete(matchId);
    console.log(`Battle ${matchId} cleaned up`);
  }, 30000); // Clean up after 30 seconds
}

function checkGameEnd(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) return;

  // For now, we'll let the timer handle game end
  // This function can be extended for early completion logic if needed
}

function broadcastToMatch(matchId: string, message: any) {
  const battle = battles.get(matchId);
  if (!battle) {
    console.error(`Cannot broadcast to battle ${matchId}: battle not found`);
    return;
  }

  const messageStr = JSON.stringify(message);
  console.log(`Broadcasting to match ${matchId}:`, message.type);
  
  // Create a copy of the players map to avoid modification during iteration
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
      // Remove disconnected socket
      battle.players.delete(wallet);
      battle.playerTaps.delete(wallet);
    }
  }
}
