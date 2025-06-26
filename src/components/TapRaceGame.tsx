
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { getGameStateDisplay } from './game/GameStateDisplay';
import { useGameTimers } from './game/GameTimers';
import { PlayerStats } from './game/PlayerStats';
import { GameArea } from './game/GameArea';
import { GameControls } from './game/GameControls';
import { GameInstructions } from './game/GameInstructions';

interface TapRaceGameProps {
  onGameComplete: (score: number, won: boolean, earnings: number) => void;
}

const TapRaceGame = ({ onGameComplete }: TapRaceGameProps) => {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'active' | 'finished'>('lobby');
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [countdownTime, setCountdownTime] = useState(3);
  const [wager] = useState(10);

  const endGame = () => {
    setGameState('finished');
    onGameComplete(tapCount, true, wager);
  };

  useGameTimers({
    gameState,
    timeLeft,
    countdownTime,
    setTimeLeft,
    setCountdownTime,
    setGameState,
    onGameEnd: endGame
  });

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

  const resetGame = () => {
    setGameState('lobby');
    setTapCount(0);
    setTimeLeft(10);
    setCountdownTime(3);
  };

  const stateDisplay = getGameStateDisplay({ gameState, countdownTime, timeLeft, tapCount });

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
            <PlayerStats tapCount={tapCount} />
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <GameArea 
        gameState={gameState}
        stateDisplay={stateDisplay}
        timeLeft={timeLeft}
        tapCount={tapCount}
        onTap={handleTap}
      />

      {/* Controls */}
      <GameControls 
        gameState={gameState}
        onStart={startCountdown}
        onReset={resetGame}
      />

      {/* Game Instructions */}
      <GameInstructions />
    </div>
  );
};

export default TapRaceGame;
