
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

    // Start countdown if we have 2 players
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
      battle.playerTaps.delete(walletAddress);
      
      if (battle.players.size === 0) {
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
  if (!battle) return;

  switch (message.type) {
    case 'tap':
      if (battle.gameState === 'active') {
        const currentTaps = battle.playerTaps.get(walletAddress) || 0;
        battle.playerTaps.set(walletAddress, currentTaps + 1);
        
        // Broadcast tap update to all players
        broadcastToMatch(matchId, {
          type: 'tap_update',
          wallet: walletAddress,
          taps: currentTaps + 1,
          timestamp: Date.now()
        });
      }
      break;
      
    case 'game_complete':
      // Handle individual player completion
      const finalScore = battle.playerTaps.get(walletAddress) || 0;
      broadcastToMatch(matchId, {
        type: 'player_finished',
        wallet: walletAddress,
        score: finalScore
      });
      
      // Check if both players finished
      checkGameEnd(matchId);
      break;
  }
}

function startCountdown(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle || battle.players.size < 2) return;

  battle.gameState = 'countdown';
  battle.countdownStart = Date.now();
  
  broadcastToMatch(matchId, {
    type: 'countdown_start',
    startTime: battle.countdownStart,
    duration: 3000 // 3 seconds
  });

  // Start the actual game after countdown
  setTimeout(() => {
    startGame(matchId);
  }, 3000);
}

function startGame(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) return;

  battle.gameState = 'active';
  battle.gameStart = Date.now();
  
  // Reset tap counts
  for (const wallet of battle.players.keys()) {
    battle.playerTaps.set(wallet, 0);
  }

  broadcastToMatch(matchId, {
    type: 'game_start',
    startTime: battle.gameStart,
    duration: 10000 // 10 seconds
  });

  // End game after 10 seconds
  setTimeout(() => {
    endGame(matchId);
  }, 10000);
}

function endGame(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) return;

  battle.gameState = 'finished';
  
  // Calculate final scores and winner
  const scores = Array.from(battle.playerTaps.entries()).map(([wallet, taps]) => ({
    wallet,
    score: taps
  }));
  
  const winner = scores.reduce((prev, current) => 
    prev.score > current.score ? prev : current
  );

  broadcastToMatch(matchId, {
    type: 'game_end',
    scores,
    winner: winner.wallet,
    timestamp: Date.now()
  });
}

function checkGameEnd(matchId: string) {
  const battle = battles.get(matchId);
  if (!battle) return;

  // For now, we'll let the timer handle game end
  // This function can be extended for early completion logic
}

function broadcastToMatch(matchId: string, message: any) {
  const battle = battles.get(matchId);
  if (!battle) return;

  const messageStr = JSON.stringify(message);
  
  for (const [wallet, socket] of battle.players) {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
      }
    } catch (error) {
      console.error(`Error sending message to ${wallet}:`, error);
      // Remove disconnected socket
      battle.players.delete(wallet);
      battle.playerTaps.delete(wallet);
    }
  }
}
