
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Timer, Zap, Trophy, Users, Coins, ArrowLeft, RotateCcw } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useWebSocketBattle } from '@/hooks/useWebSocketBattle';
import { useNavigate } from 'react-router-dom';
import { PlayerStats } from './game/PlayerStats';
import { GameTimers } from './game/GameTimers';

interface RealTimeGameProps {
  matchId: string;
  walletAddress: string;
  onGameComplete?: () => void;
}

const RealTimeGame = ({ matchId, walletAddress, onGameComplete }: RealTimeGameProps) => {
  const [match, setMatch] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [showPostGame, setShowPostGame] = useState(false);
  
  const { getMatch, submitTapResult, getPlayerStats, getMatchWithResults } = useMatches();
  const { isConnected, battleState, sendTap, disconnect } = useWebSocketBattle(matchId, walletAddress);
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
        
        // Check if match is already completed
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
        setSubmissionStatus('submitted');
        setHasSubmittedScore(true);
        
        // Update player stats
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
      handleGameComplete();
    }
  }, [battleState.gameState, battleState.winner, hasSubmittedScore]);

  const handleGameComplete = async () => {
    if (hasSubmittedScore || submissionStatus !== 'idle') {
      return;
    }

    setSubmissionStatus('submitting');
    setHasSubmittedScore(true);

    const myScore = battleState.playerTaps[walletAddress] || 0;
    
    // Create unique signature with timestamp and random component
    const timestamp = Date.now();
    const randomComponent = Math.random().toString(36).substring(2, 15);
    const message = `match:${matchId},score:${myScore},timestamp:${timestamp},random:${randomComponent}`;
    const signature = btoa(message);

    try {
      console.log('Submitting final score:', myScore);
      await submitTapResult(matchId, walletAddress, myScore, signature);
      setSubmissionStatus('submitted');
      setShowPostGame(true);
      
      // Update player stats after successful submission
      setTimeout(async () => {
        try {
          const updatedStats = await getPlayerStats(walletAddress);
          setPlayerStats(updatedStats);
        } catch (error) {
          console.warn('Could not update player stats:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit result:', error);
      setSubmissionStatus('failed');
      setHasSubmittedScore(false); // Allow retry
    }

    if (onGameComplete) {
      onGameComplete();
    }
  };

  const retrySubmission = async () => {
    if (hasSubmittedScore) {
      console.warn('Score already submitted, cannot retry');
      return;
    }
    
    setSubmissionStatus('idle');
    await handleGameComplete();
  };

  const handlePlayAgain = () => {
    disconnect();
    navigate('/');
  };

  const getGameStateDisplay = () => {
    switch (battleState.gameState) {
      case 'waiting':
        return {
          title: '⏳ Waiting for Players',
          subtitle: `${battleState.playerCount}/2 players connected`,
          bgColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
          textColor: 'text-white'
        };
      case 'countdown':
        return {
          title: battleState.countdownTime.toString(),
          subtitle: 'Get ready to tap!',
          bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
          textColor: 'text-white'
        };
      case 'active':
        return {
          title: 'TAP!',
          subtitle: `${battleState.gameTime}s remaining`,
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          textColor: 'text-white'
        };
      case 'finished':
        const myScore = battleState.playerTaps[walletAddress] || 0;
        const isWinner = battleState.winner === walletAddress;
        
        if (battleState.winner) {
          return {
            title: isWinner ? '🎉 Victory!' : '💀 Defeat',
            subtitle: `Your score: ${myScore} taps`,
            bgColor: isWinner 
              ? 'bg-gradient-to-br from-emerald-500 to-green-600'
              : 'bg-gradient-to-br from-red-500 to-pink-600',
            textColor: 'text-white'
          };
        }
        
        let title = '';
        if (submissionStatus === 'submitting') {
          title = '⏳ Submitting...';
        } else if (submissionStatus === 'failed') {
          title = '⚠️ Submission Failed';
        } else if (submissionStatus === 'submitted') {
          title = '✅ Score Submitted';
        } else {
          title = 'Game Complete!';
        }
        
        return {
          title,
          subtitle: `Your score: ${myScore} taps`,
          bgColor: submissionStatus === 'failed' 
            ? 'bg-gradient-to-br from-red-500 to-pink-600'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600',
          textColor: 'text-white'
        };
    }
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
  const stateDisplay = getGameStateDisplay();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Connection Status */}
      <div className="flex justify-center">
        <Badge className={`${isConnected ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
          {isConnected ? '🔴 LIVE WebSocket' : '❌ Disconnected'}
        </Badge>
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
            {/* Your Stats */}
            <PlayerStats tapCount={myTaps} />
            
            {/* Opponent Stats */}
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
          <div 
            className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
            onClick={battleState.gameState === 'active' ? sendTap : undefined}
          >
            {/* Tap Effects */}
            {battleState.gameState === 'active' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            <div className="text-4xl md:text-6xl font-bold mb-4">{stateDisplay.title}</div>
            <div className="text-lg md:text-xl mb-4 text-center px-4">{stateDisplay.subtitle}</div>
            
            {battleState.gameState === 'active' && (
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm md:text-lg px-4">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Timer className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Time: {battleState.gameTime}s</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  <span>You: {myTaps}</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Opponent: {opponentTaps}</span>
                </div>
              </div>
            )}

            {battleState.gameState === 'finished' && !battleState.winner && (
              <div className="text-sm md:text-lg mt-4 bg-white/20 rounded-lg px-4 md:px-6 py-3 text-center mx-4">
                {submissionStatus === 'submitting' && (
                  <div>⏳ Submitting your score...</div>
                )}
                {submissionStatus === 'failed' && (
                  <div>
                    <div className="mb-2">⚠️ Submission failed. Try again?</div>
                    <Button 
                      onClick={retrySubmission}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Retry Submission
                    </Button>
                  </div>
                )}
                {submissionStatus === 'submitted' && (
                  <div>✅ Score submitted successfully!</div>
                )}
              </div>
            )}

            {battleState.gameState === 'finished' && battleState.winner && (
              <div className="text-sm md:text-lg mt-4 bg-white/20 rounded-lg px-4 md:px-6 py-3 text-center mx-4">
                <div className="mb-2">Battle Complete!</div>
                <div>Winner: {battleState.winner === walletAddress ? 'YOU!' : `${battleState.winner.slice(0, 8)}...`}</div>
                <div className="text-xs md:text-sm mt-2">
                  Final Score: {myTaps} vs {opponentTaps}
                </div>
                {battleState.winner === walletAddress && (
                  <div className="text-xs md:text-sm mt-2 text-emerald-200">
                    You won {match.wager * 2} GORB! 💰
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
        {battleState.gameState === 'finished' && submissionStatus === 'failed' && (
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
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
