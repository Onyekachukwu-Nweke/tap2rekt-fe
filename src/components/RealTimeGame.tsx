
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Timer, Zap, Trophy, Users, Coins } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeGameProps {
  matchId: string;
  walletAddress: string;
  onGameComplete?: () => void;
}

const RealTimeGame = ({ matchId, walletAddress, onGameComplete }: RealTimeGameProps) => {
  const [match, setMatch] = useState<any>(null);
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'active' | 'finished'>('waiting');
  const [tapCount, setTapCount] = useState(0);
  const [opponentTaps, setOpponentTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [countdownTime, setCountdownTime] = useState(3);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { getMatch, submitTapResult, getTapResults } = useMatches();

  // Load match data
  useEffect(() => {
    const loadMatch = async () => {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      
      if (matchData?.status === 'in_progress') {
        setGameState('countdown');
      }
    };
    loadMatch();
  }, [matchId, getMatch]);

  // Real-time subscriptions
  useEffect(() => {
    if (!matchId) return;

    // Subscribe to match updates
    const matchChannel = supabase
      .channel(`match-${matchId}`)
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
          
          if (updatedMatch.status === 'in_progress' && gameState === 'waiting') {
            setGameState('countdown');
          }
        }
      )
      .subscribe();

    // Subscribe to tap results
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
          if (result.wallet_address !== walletAddress) {
            setOpponentTaps(result.score);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, [matchId, walletAddress, gameState]);

  // Countdown timer
  useEffect(() => {
    if (gameState === 'countdown' && countdownTime > 0) {
      const timer = setTimeout(() => {
        setCountdownTime(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdownTime === 0) {
      setGameState('active');
      setTimeLeft(10);
    }
  }, [gameState, countdownTime]);

  // Game timer
  useEffect(() => {
    if (gameState === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState === 'active' && timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const handleTap = () => {
    if (gameState === 'active') {
      setTapCount(prev => prev + 1);
    }
  };

  const endGame = async () => {
    if (hasSubmitted) return;
    
    setGameState('finished');
    setHasSubmitted(true);

    // Create a simple signature (in real app, use wallet.signMessage)
    const message = `match:${matchId},score:${tapCount},timestamp:${new Date().toISOString()}`;
    const signature = btoa(message); // Mock signature - replace with real wallet signing

    try {
      await submitTapResult(matchId, walletAddress, tapCount, signature);
    } catch (error) {
      console.error('Failed to submit result:', error);
    }

    if (onGameComplete) {
      onGameComplete();
    }
  };

  const getGameStateDisplay = () => {
    switch (gameState) {
      case 'waiting':
        return {
          title: '⏳ Waiting for Opponent',
          subtitle: 'Share the match link or wait for someone to join',
          bgColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
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
        return {
          title: 'Game Complete!',
          subtitle: `Your score: ${tapCount} taps`,
          bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
          textColor: 'text-white'
        };
    }
  };

  const stateDisplay = getGameStateDisplay();

  if (!match) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400">Loading match...</div>
      </div>
    );
  }

  const isCreator = match.creator_wallet === walletAddress;
  const opponent = isCreator ? match.opponent_wallet : match.creator_wallet;

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Tap Race Battle
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg px-4 py-2">
              {match.wager * 2} GORB Prize
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Player Stats */}
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
                {opponent ? `${opponent.slice(0, 8)}...${opponent.slice(-4)}` : 'Waiting...'}
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
              <div className="text-lg mt-4 bg-white/20 rounded-lg px-6 py-3">
                🎮 Waiting for opponent to finish...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeGame;
