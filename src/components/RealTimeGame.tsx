import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useWebSocketBattle } from '@/hooks/useWebSocketBattle';
import { useGameSubmission } from '@/hooks/useGameSubmission';
import { useNavigate } from 'react-router-dom';
import { PlayerStats } from './game/PlayerStats';
import { GameTimers } from './game/GameTimers';
import { WebSocketConnection } from './game/WebSocketConnection';
import { WebSocketGameState } from './game/WebSocketGameState';
import { GameSubmissionHandler } from './game/GameSubmissionHandler';

interface RealTimeGameProps {
  matchId: string;
  walletAddress: string;
  onGameComplete?: () => void;
}

const RealTimeGame = ({ matchId, walletAddress, onGameComplete }: RealTimeGameProps) => {
  const [match, setMatch] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [showPostGame, setShowPostGame] = useState(false);
  
  const { getMatch, getPlayerStats, getMatchWithResults } = useMatches();
  const { isConnected, battleState, sendTap, disconnect } = useWebSocketBattle(matchId, walletAddress);
  const { submissionStatus, hasSubmittedScore, submitScore, retrySubmission } = useGameSubmission(matchId, walletAddress);
  const navigate = useNavigate();

  // Load player stats
  useEffect(() => {
    const loadPlayerStats = async () => {
      if (walletAddress) {
        try {
          const stats = await getPlayerStats(walletAddress);
          setPlayerStats(stats);
        } catch (error) {
          console.warn('Could not load player stats:', error);
        }
      }
    };
    loadPlayerStats();
  }, [walletAddress, getPlayerStats]);

  // Load match data
  useEffect(() => {
    const loadMatch = async () => {
      try {
        const matchData = await getMatch(matchId);
        setMatch(matchData);
        
        if (matchData?.status === 'completed') {
          await loadCompletedMatchData();
          return;
        }
      } catch (error) {
        console.error('Error loading match:', error);
      }
    };
    loadMatch();
  }, [matchId, getMatch]);

  const loadCompletedMatchData = async () => {
    try {
      const matchWithResults = await getMatchWithResults(matchId);
      if (matchWithResults) {
        setMatch(matchWithResults.match);
        setShowPostGame(true);
        
        const updatedStats = await getPlayerStats(walletAddress);
        setPlayerStats(updatedStats);
      }
    } catch (error) {
      console.error('Error loading completed match data:', error);
    }
  };

  // Handle game completion from WebSocket
  useEffect(() => {
    if (battleState.gameState === 'finished' && battleState.winner && !hasSubmittedScore) {
      const myScore = battleState.playerTaps[walletAddress] || 0;
      submitScore(myScore);
      setShowPostGame(true);
      
      if (onGameComplete) {
        onGameComplete();
      }
    }
  }, [battleState.gameState, battleState.winner, hasSubmittedScore, battleState.playerTaps, walletAddress, submitScore, onGameComplete]);

  const handlePlayAgain = () => {
    disconnect();
    navigate('/');
  };

  const handleRetrySubmission = async () => {
    retrySubmission();
    const myScore = battleState.playerTaps[walletAddress] || 0;
    await submitScore(myScore);
  };

  const handleRetryConnection = () => {
    disconnect();
    // The useEffect in useWebSocketBattle will automatically reconnect
    toast({
      title: "🔄 Reconnecting...",
      description: "Attempting to reconnect to the battle",
    });
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading match...</div>
      </div>
    );
  }

  const isCreator = match.creator_wallet === walletAddress;
  const opponentWallet = isCreator ? match.opponent_wallet : match.creator_wallet;
  const myTaps = battleState.playerTaps[walletAddress] || 0;
  const opponentTaps = battleState.playerTaps[opponentWallet] || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Connection Status */}
      <div className="flex justify-center">
        <WebSocketConnection 
          isConnected={isConnected}
          playerCount={battleState.playerCount}
          onRetryConnection={handleRetryConnection}
        />
      </div>

      {/* Match Info Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-400" />
              <span className="text-base md:text-lg">
                {battleState.gameState === 'finished' && battleState.winner ? 'Battle Complete' : 'Real WebSocket Battle - LIVE'}
              </span>
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
              {match.wager * 2} GORB Prize
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <PlayerStats tapCount={myTaps} />
            
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-sm md:text-lg font-bold text-red-300 break-all">
                {opponentWallet ? `${opponentWallet.slice(0, 6)}...${opponentWallet.slice(-4)}` : 'Opponent'}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">{opponentTaps}</div>
              <div className="text-xs md:text-sm text-slate-400">Taps</div>
              {battleState.gameState === 'finished' && battleState.winner && battleState.winner !== walletAddress && (
                <Badge className="mt-2 bg-emerald-600">Winner!</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Timers */}
      <GameTimers 
        gameState={battleState.gameState}
        countdownTime={battleState.countdownTime}
        timeLeft={battleState.gameTime}
      />

      {/* Game Area */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <WebSocketGameState
            gameState={battleState.gameState}
            countdownTime={battleState.countdownTime}
            gameTime={battleState.gameTime}
            myTaps={myTaps}
            opponentTaps={opponentTaps}
            walletAddress={walletAddress}
            winner={battleState.winner}
            submissionStatus={submissionStatus}
            onTap={sendTap}
          />
        </CardContent>
      </Card>

      {/* Game Submission Handler */}
      <GameSubmissionHandler
        submissionStatus={submissionStatus}
        myScore={myTaps}
        opponentScore={opponentTaps}
        winner={battleState.winner}
        walletAddress={walletAddress}
        onRetrySubmission={handleRetrySubmission}
      />

      {/* Player Stats Display */}
      {battleState.gameState === 'finished' && playerStats && showPostGame && battleState.winner && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2 text-amber-400" />
              <span className="text-base md:text-lg">Updated Battle Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
              <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                <div className="text-xl md:text-2xl font-bold text-purple-300">{playerStats.total_battles || 0}</div>
                <div className="text-xs md:text-sm text-slate-400">Total Battles</div>
              </div>
              <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                <div className="text-xl md:text-2xl font-bold text-amber-300">{playerStats.total_victories || 0}</div>
                <div className="text-xs md:text-sm text-slate-400">Victories</div>
              </div>
              <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                <div className="text-xl md:text-2xl font-bold text-indigo-300">{playerStats.best_tap_count || 0}</div>
                <div className="text-xs md:text-sm text-slate-400">Best Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {battleState.gameState === 'finished' && battleState.winner && (
          <>
            <Button 
              onClick={handlePlayAgain}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </>
        )}
        {['waiting', 'countdown', 'active'].includes(battleState.gameState) && (
          <Button 
            onClick={() => {
              disconnect();
              navigate('/');
            }}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        )}
      </div>
    </div>
  );
};

export default RealTimeGame;
