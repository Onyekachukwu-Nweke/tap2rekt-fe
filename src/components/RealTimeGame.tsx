
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Timer, Zap, Trophy, Users, Coins, ArrowLeft, RotateCcw } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useRealTimeTaps } from '@/hooks/useRealTimeTaps';
import { supabase } from '@/integrations/supabase/client';
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
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'active' | 'finished'>('lobby');
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdownTime, setCountdownTime] = useState(3);
  const [winner, setWinner] = useState<string | null>(null);
  const [finalScores, setFinalScores] = useState<{[key: string]: number}>({});
  const [showPostGame, setShowPostGame] = useState(false);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const { getMatch, submitTapResult, getMatchWithResults, getPlayerStats } = useMatches();
  const { playerTaps, isConnected, sendTapUpdate, sendFinalScore } = useRealTimeTaps(matchId, walletAddress);
  const navigate = useNavigate();

  // Load player stats with error handling
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

  // Load match data and immediately start countdown
  useEffect(() => {
    const loadMatchAndStart = async () => {
      try {
        const matchData = await getMatch(matchId);
        setMatch(matchData);
        
        // Check if match is already completed
        if (matchData?.status === 'completed') {
          await loadCompletedMatchData();
          return;
        }
        
        // Check if we should start the game immediately
        if (isGameReadyToStart(matchData)) {
          initializeGame();
        }
      } catch (error) {
        console.error('Error loading match:', error);
      }
    };
    loadMatchAndStart();
  }, [matchId, getMatch]);

  const loadCompletedMatchData = async () => {
    try {
      const matchWithResults = await getMatchWithResults(matchId);
      if (matchWithResults) {
        setMatch(matchWithResults.match);
        setWinner(matchWithResults.match.winner_wallet);
        
        // Set final scores from tap results
        const scores: {[key: string]: number} = {};
        matchWithResults.tapResults.forEach((result: any) => {
          scores[result.wallet_address] = result.score;
        });
        setFinalScores(scores);
        setTapCount(scores[walletAddress] || 0);
        
        setGameState('finished');
        setShowPostGame(true);
        setSubmissionStatus('submitted');
        setGameCompleted(true);
        setHasSubmittedScore(true);
      }
    } catch (error) {
      console.error('Error loading completed match data:', error);
    }
  };

  // Check if game is ready to start
  const isGameReadyToStart = (matchData: any) => {
    return matchData?.status === 'in_progress' && 
           matchData?.opponent_wallet && 
           matchData?.creator_wallet;
  };

  // Initialize the game with a synchronized countdown
  const initializeGame = () => {
    if (gameState !== 'lobby') return;
    
    setGameState('countdown');
    setTapCount(0);
    setTimeLeft(30);
    
    // Start the countdown timer
    let countdown = 3;
    setCountdownTime(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown--;
      setCountdownTime(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        startActiveGame();
      }
    }, 1000);
  };

  // Real-time subscriptions for match updates
  useEffect(() => {
    if (!matchId || gameCompleted) return;

    const matchChannel = supabase
      .channel(`match-updates-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          const updatedMatch = payload.new;
          console.log('Match updated via realtime:', updatedMatch);
          setMatch(updatedMatch);
          
          // Check if we should start the game when match is updated
          if (isGameReadyToStart(updatedMatch) && gameState === 'lobby') {
            initializeGame();
          }
          
          // Handle game completion
          if (updatedMatch.status === 'completed' && !gameCompleted) {
            console.log('Game completed via realtime');
            setGameCompleted(true);
            setWinner(updatedMatch.winner_wallet);
            setGameState('finished');
            setShowPostGame(true);
            
            // If we haven't submitted yet, mark as submitted to prevent further attempts
            if (!hasSubmittedScore) {
              setSubmissionStatus('submitted');
              setHasSubmittedScore(true);
            }
            
            // Reload match with results to get final scores
            setTimeout(async () => {
              try {
                const matchWithResults = await getMatchWithResults(matchId);
                if (matchWithResults?.tapResults) {
                  const scores: {[key: string]: number} = {};
                  matchWithResults.tapResults.forEach((result: any) => {
                    scores[result.wallet_address] = result.score;
                  });
                  setFinalScores(scores);
                }
                
                const updatedStats = await getPlayerStats(walletAddress);
                setPlayerStats(updatedStats);
              } catch (error) {
                console.warn('Could not reload match results or stats:', error);
              }
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [matchId, walletAddress, gameState, gameCompleted, hasSubmittedScore, getPlayerStats, getMatchWithResults]);

  const startActiveGame = () => {
    setGameState('active');
    setTimeLeft(30);
    
    // Start game timer
    let timeRemaining = 30;
    const gameTimer = setInterval(() => {
      timeRemaining--;
      setTimeLeft(timeRemaining);
      
      if (timeRemaining <= 0) {
        clearInterval(gameTimer);
        endGame();
      }
    }, 1000);
  };

  const handleTap = useCallback(() => {
    if (gameState === 'active') {
      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);
      
      // Send immediate real-time update for live gameplay
      sendTapUpdate(newTapCount);
    }
  }, [gameState, tapCount, sendTapUpdate]);

  const endGame = async () => {
    // Prevent multiple submissions
    if (hasSubmittedScore || gameCompleted || submissionStatus !== 'idle') {
      console.log('Game already ended or submission in progress');
      return;
    }
    
    setGameState('finished');
    setSubmissionStatus('submitting');
    setHasSubmittedScore(true);

    // Send final score to other players via real-time
    await sendFinalScore(tapCount);

    // Create a simple signature (in real app, use wallet.signMessage)
    const message = `match:${matchId},score:${tapCount},timestamp:${new Date().toISOString()}`;
    const signature = btoa(message); // Mock signature - replace with real wallet signing

    try {
      console.log('Submitting final score:', tapCount);
      const result = await submitTapResult(matchId, walletAddress, tapCount, signature);
      setSubmissionStatus('submitted');
      console.log('Result submitted successfully:', result);
      
    } catch (error) {
      console.error('Failed to submit result:', error);
      if (!gameCompleted) {
        setSubmissionStatus('failed');
        setHasSubmittedScore(false); // Allow retry
      }
    }

    if (onGameComplete) {
      onGameComplete();
    }
  };

  const retrySubmission = async () => {
    if (gameCompleted || hasSubmittedScore) {
      console.warn('Game already completed, cannot retry');
      return;
    }

    setSubmissionStatus('submitting');
    
    const message = `match:${matchId},score:${tapCount},timestamp:${new Date().toISOString()}`;
    const signature = btoa(message);

    try {
      await submitTapResult(matchId, walletAddress, tapCount, signature);
      setSubmissionStatus('submitted');
      setHasSubmittedScore(true);
    } catch (error) {
      console.error('Retry submission failed:', error);
      if (!gameCompleted) {
        setSubmissionStatus('failed');
      }
    }
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  const getGameStateDisplay = () => {
    switch (gameState) {
      case 'lobby':
        return {
          title: '⚡ Starting Battle',
          subtitle: 'Get ready for real multiplayer action!',
          bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
          textColor: 'text-white'
        };
      case 'countdown':
        return {
          title: countdownTime.toString(),
          subtitle: 'Get ready to tap!',
          bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
          textColor: 'text-white'
        };
      case 'active':
        return {
          title: 'TAP!',
          subtitle: `${timeLeft}s remaining`,
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          textColor: 'text-white'
        };
      case 'finished':
        if (gameCompleted && winner) {
          const isWinner = winner === walletAddress;
          return {
            title: isWinner ? '🎉 Victory!' : '💀 Defeat',
            subtitle: `Final Score: ${finalScores[walletAddress] || tapCount} taps`,
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
          title = '⏳ Waiting for opponent...';
        } else {
          title = 'Game Complete!';
        }
        
        return {
          title,
          subtitle: `Your score: ${finalScores[walletAddress] || tapCount} taps`,
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
  const opponentTaps = playerTaps[opponentWallet] || finalScores[opponentWallet] || 0;
  const myFinalScore = finalScores[walletAddress] || tapCount;
  const stateDisplay = getGameStateDisplay();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Connection Status */}
      {gameState === 'active' && (
        <div className="flex justify-center">
          <Badge className={`${isConnected ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {isConnected ? '🔴 LIVE' : '❌ Disconnected'}
          </Badge>
        </div>
      )}

      {/* Match Info Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-400" />
              <span className="text-base md:text-lg">{gameCompleted ? 'Battle Complete' : 'Real 1v1 Battle - LIVE'}</span>
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
              {match.wager * 2} GORB Prize
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Your Stats */}
            <PlayerStats tapCount={myFinalScore} />
            
            {/* Opponent Stats */}
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-sm md:text-lg font-bold text-red-300 break-all">
                {isCreator ? 
                  (match.opponent_wallet ? `${match.opponent_wallet.slice(0, 6)}...${match.opponent_wallet.slice(-4)}` : 'Opponent') :
                  `${match.creator_wallet.slice(0, 6)}...${match.creator_wallet.slice(-4)}`
                }
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">{opponentTaps}</div>
              <div className="text-xs md:text-sm text-slate-400">Taps</div>
              {gameCompleted && winner && winner !== walletAddress && (
                <Badge className="mt-2 bg-emerald-600">Winner!</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Timers */}
      <GameTimers 
        gameState={gameState}
        countdownTime={countdownTime}
        timeLeft={timeLeft}
      />

      {/* Game Area */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div 
            className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
            onClick={gameState === 'active' ? handleTap : undefined}
          >
            {/* Tap Effects */}
            {gameState === 'active' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            <div className="text-4xl md:text-6xl font-bold mb-4">{stateDisplay.title}</div>
            <div className="text-lg md:text-xl mb-4 text-center px-4">{stateDisplay.subtitle}</div>
            
            {gameState === 'active' && (
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm md:text-lg px-4">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Timer className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Time: {timeLeft}s</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Taps: {tapCount}</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Opponent: {opponentTaps}</span>
                </div>
              </div>
            )}

            {gameState === 'finished' && !gameCompleted && (
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
                  <div>⏳ Waiting for opponent to finish...</div>
                )}
              </div>
            )}

            {gameCompleted && winner && (
              <div className="text-sm md:text-lg mt-4 bg-white/20 rounded-lg px-4 md:px-6 py-3 text-center mx-4">
                <div className="mb-2">Battle Complete!</div>
                <div>Winner: {winner === walletAddress ? 'YOU!' : `${winner.slice(0, 8)}...`}</div>
                <div className="text-xs md:text-sm mt-2">
                  Final Score: {finalScores[walletAddress] || tapCount} vs {opponentTaps}
                </div>
                {winner === walletAddress && (
                  <div className="text-xs md:text-sm mt-2 text-emerald-200">
                    You won {match.wager * 2} GORB! 💰
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Updated Player Stats Display */}
      {gameCompleted && playerStats && showPostGame && winner && (
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
        {gameCompleted && winner && (
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
        {gameState === 'finished' && (submissionStatus === 'failed') && (
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        )}
        {(gameState === 'lobby' || gameState === 'countdown' || gameState === 'active') && (
          <Button 
            onClick={() => navigate('/')}
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
