
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Timer, Zap, Trophy, Users, Coins, ArrowLeft } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface RealTimeGameProps {
  matchId: string;
  walletAddress: string;
  onGameComplete?: () => void;
}

const RealTimeGame = ({ matchId, walletAddress, onGameComplete }: RealTimeGameProps) => {
  const [match, setMatch] = useState<any>(null);
  const [gameState, setGameState] = useState<'loading' | 'countdown' | 'active' | 'finished'>('loading');
  const [tapCount, setTapCount] = useState(0);
  const [opponentTaps, setOpponentTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [countdownTime, setCountdownTime] = useState(3);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const { getMatch, submitTapResult, getTapResults } = useMatches();
  const navigate = useNavigate();

  // Load match data and immediately start countdown
  useEffect(() => {
    const loadMatchAndStart = async () => {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      
      console.log('RealTimeGame loaded match - starting immediately:', matchData);
      
      // IMMEDIATE START - No waiting, both players start synchronized countdown
      if (matchData?.status === 'in_progress' && 
          matchData?.opponent_wallet && 
          matchData?.creator_wallet) {
        console.log('Both players present - starting IMMEDIATE synchronized countdown');
        startImmediateCountdown();
      }
    };
    loadMatchAndStart();
  }, [matchId, getMatch]);

  // Real-time subscriptions for match updates and tap results
  useEffect(() => {
    if (!matchId) return;

    // Subscribe to match updates
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
          setMatch(updatedMatch);
          
          console.log('Match updated in RealTimeGame:', updatedMatch);
          
          // Handle game completion
          if (updatedMatch.status === 'completed' && updatedMatch.winner_wallet) {
            setWinner(updatedMatch.winner_wallet);
            setGameState('finished');
          }
        }
      )
      .subscribe();

    // Subscribe to tap results for real-time opponent progress
    const resultsChannel = supabase
      .channel(`results-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tap_results',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const result = payload.new;
          console.log('New tap result received:', result);
          
          // Update opponent taps if it's not from current player
          if (result.wallet_address !== walletAddress) {
            setOpponentTaps(result.score);
            console.log('Opponent final score updated:', result.score);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, [matchId, walletAddress]);

  const startImmediateCountdown = () => {
    console.log('Starting IMMEDIATE synchronized countdown for both players');
    setGameState('countdown');
    setCountdownTime(3);
    setTapCount(0);
    setOpponentTaps(0);
    setTimeLeft(10);
    setHasSubmitted(false);
    
    // Start countdown timer immediately
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      setCountdownTime(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        startActiveGame();
      }
    }, 1000);
  };

  const startActiveGame = () => {
    console.log('Starting ACTIVE game phase');
    setGameState('active');
    setTimeLeft(10);
    
    // Start game timer
    let timeRemaining = 10;
    const gameTimer = setInterval(() => {
      timeRemaining--;
      setTimeLeft(timeRemaining);
      
      if (timeRemaining <= 0) {
        clearInterval(gameTimer);
        endGame();
      }
    }, 1000);
  };

  const handleTap = () => {
    if (gameState === 'active') {
      setTapCount(prev => prev + 1);
    }
  };

  const endGame = async () => {
    if (hasSubmitted) return;
    
    console.log('Game ended, submitting score:', tapCount);
    setGameState('finished');
    setHasSubmitted(true);

    // Create a simple signature (in real app, use wallet.signMessage)
    const message = `match:${matchId},score:${tapCount},timestamp:${new Date().toISOString()}`;
    const signature = btoa(message); // Mock signature - replace with real wallet signing

    try {
      await submitTapResult(matchId, walletAddress, tapCount, signature);
      console.log('Score submitted successfully');
    } catch (error) {
      console.error('Failed to submit result:', error);
    }

    if (onGameComplete) {
      onGameComplete();
    }
  };

  const getGameStateDisplay = () => {
    switch (gameState) {
      case 'loading':
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
        const isWinner = winner === walletAddress;
        return {
          title: winner ? (isWinner ? '🎉 Victory!' : '💀 Defeat') : 'Game Complete!',
          subtitle: `Your score: ${tapCount} taps`,
          bgColor: winner ? (isWinner 
            ? 'bg-gradient-to-br from-emerald-500 to-green-600'
            : 'bg-gradient-to-br from-red-500 to-pink-600')
            : 'bg-gradient-to-br from-purple-500 to-indigo-600',
          textColor: 'text-white'
        };
    }
  };

  const stateDisplay = getGameStateDisplay();

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading match...</div>
      </div>
    );
  }

  const isCreator = match.creator_wallet === walletAddress;
  const opponentWallet = isCreator ? match.opponent_wallet : match.creator_wallet;

  return (
    <div className="space-y-6">
      {/* Match Info Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Real 1v1 Battle - LIVE
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg px-4 py-2">
              {match.wager * 2} GORB Prize
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Your Stats */}
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-bold text-purple-300">You</div>
              <div className="text-3xl font-bold text-white">{tapCount}</div>
              <div className="text-sm text-slate-400">Taps</div>
            </div>
            
            {/* Opponent Stats */}
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-bold text-red-300">
                {opponentWallet ? `${opponentWallet.slice(0, 8)}...${opponentWallet.slice(-4)}` : 'Opponent'}
              </div>
              <div className="text-3xl font-bold text-white">{opponentTaps}</div>
              <div className="text-sm text-slate-400">Taps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div 
            className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
            onClick={handleTap}
          >
            {/* Tap Effects */}
            {gameState === 'active' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            <div className="text-6xl font-bold mb-4">{stateDisplay.title}</div>
            <div className="text-xl mb-4">{stateDisplay.subtitle}</div>
            
            {gameState === 'active' && (
              <div className="flex items-center space-x-4 text-lg">
                <Timer className="w-5 h-5" />
                <span>Time: {timeLeft}s</span>
                <Zap className="w-5 h-5 ml-6" />
                <span>Taps: {tapCount}</span>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-lg mt-4 bg-white/20 rounded-lg px-6 py-3 text-center">
                {winner ? (
                  <div>
                    <div className="mb-2">Battle Complete!</div>
                    <div>Winner: {winner === walletAddress ? 'YOU!' : `${winner.slice(0, 8)}...`}</div>
                    <div className="text-sm mt-2">Final Score: {tapCount} vs {opponentTaps}</div>
                  </div>
                ) : (
                  <div>🎮 Waiting for results...</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>
      </div>
    </div>
  );
};

export default RealTimeGame;
