
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Timer, Zap, Trophy, Users, Coins } from 'lucide-react';

interface TapRaceGameProps {
  onGameComplete: (score: number, won: boolean, earnings: number) => void;
}

const TapRaceGame = ({ onGameComplete }: TapRaceGameProps) => {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'active' | 'finished'>('lobby');
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [countdownTime, setCountdownTime] = useState(3);
  const [wager, setWager] = useState(10);

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

  // Countdown timer
  useEffect(() => {
    if (gameState === 'countdown' && countdownTime > 0) {
      const timer = setTimeout(() => {
        setCountdownTime(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdownTime === 0) {
      setGameState('active');
    }
  }, [gameState, countdownTime]);

  const startCountdown = () => {
    setGameState('countdown');
    setCountdownTime(3);
    setTapCount(0);
    setTimeLeft(10);
  };

  const handleTap = () => {
    if (gameState === 'active') {
      setTapCount(prev => prev + 1);
    }
  };

  const endGame = () => {
    setGameState('finished');
    // For single player mode, always consider it a win
    onGameComplete(tapCount, true, wager);
  };

  const resetGame = () => {
    setGameState('lobby');
    setTapCount(0);
    setTimeLeft(10);
    setCountdownTime(3);
  };

  const getGameStateDisplay = () => {
    switch (gameState) {
      case 'lobby':
        return {
          title: '🎯 Practice Mode',
          subtitle: 'Single player tap challenge',
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
          title: '🎉 Complete!',
          subtitle: `Your score: ${tapCount} taps`,
          bgColor: 'bg-gradient-to-br from-emerald-500 to-green-600',
          textColor: 'text-white'
        };
    }
  };

  const stateDisplay = getGameStateDisplay();

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Practice Mode
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg px-4 py-2">
              Solo Challenge
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {/* Player Stats */}
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-bold text-purple-300">You</div>
              <div className="text-3xl font-bold text-white">{tapCount}</div>
              <div className="text-sm text-slate-400">Taps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div 
            className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
            onClick={handleTap}
          >
            {/* Tap Effects */}
            {gameState === 'active' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            <div className="text-8xl font-bold mb-6">{stateDisplay.title}</div>
            <div className="text-2xl mb-4">{stateDisplay.subtitle}</div>
            
            {gameState === 'active' && (
              <div className="flex items-center space-x-4 text-xl">
                <Timer className="w-6 h-6" />
                <span>Time: {timeLeft}s</span>
                <Zap className="w-6 h-6 ml-8" />
                <span>Taps: {tapCount}</span>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-lg mt-4 bg-white/20 rounded-lg px-6 py-3">
                🎯 Practice Complete!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {gameState === 'lobby' && (
          <Button 
            onClick={startCountdown}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-bold px-8 py-4"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Practice!
          </Button>
        )}
        
        {gameState === 'finished' && (
          <div className="flex space-x-4">
            <Button 
              onClick={resetGame}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-bold px-8 py-4"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Practice Again
            </Button>
          </div>
        )}
      </div>

      {/* Game Instructions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Practice Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
              <div className="font-semibold text-purple-400 mb-2">1. Get Ready</div>
              <div>3-second countdown to prepare</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
              <div className="font-semibold text-amber-400 mb-2">2. Tap Fast</div>
              <div>Click/tap as fast as possible for 10 seconds</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
              <div className="font-semibold text-emerald-400 mb-2">3. Practice</div>
              <div>Build your speed for real battles!</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TapRaceGame;
