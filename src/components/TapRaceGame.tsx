
import { useState, useEffect, useCallback } from 'react';
import { GameStateDisplay } from './game/GameStateDisplay';
import { GameTimers } from './game/GameTimers';
import { PlayerStats } from './game/PlayerStats';
import { GameArea } from './game/GameArea';
import { GameControls } from './game/GameControls';
import { GameInstructions } from './game/GameInstructions';

interface TapRaceGameProps {
  onGameComplete: (score: number, won: boolean, earnings?: number) => void;
}

const TapRaceGame = ({ onGameComplete }: TapRaceGameProps) => {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'active' | 'finished'>('lobby');
  const [countdownTime, setCountdownTime] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [tapCount, setTapCount] = useState(0);

  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdownTime(3);
    
    const countdownInterval = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('active');
          setTimeLeft(30);
          setTapCount(0);
          
          const gameInterval = setInterval(() => {
            setTimeLeft((time) => {
              if (time <= 1) {
                clearInterval(gameInterval);
                setGameState('finished');
                return 0;
              }
              return time - 1;
            });
          }, 1000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    setGameState('lobby');
    setCountdownTime(3);
    setTimeLeft(30);
    setTapCount(0);
  }, []);

  const handleTap = useCallback(() => {
    if (gameState === 'active') {
      setTapCount(prev => prev + 1);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      onGameComplete(tapCount, true, 0);
    }
  }, [gameState, tapCount, onGameComplete]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      <GameInstructions />
      
      <GameStateDisplay 
        gameState={gameState}
        countdownTime={countdownTime}
        timeLeft={timeLeft}
        tapCount={tapCount}
      />

      <GameTimers 
        gameState={gameState}
        countdownTime={countdownTime}
        timeLeft={timeLeft}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlayerStats tapCount={tapCount} />
        
        <GameArea 
          gameState={gameState}
          onTap={handleTap}
        />
        
        <div className="space-y-4">
          <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
            <div className="text-lg font-bold text-purple-300 mb-2">Target</div>
            <div className="text-2xl font-bold text-white">Max Taps!</div>
          </div>
        </div>
      </div>

      <GameControls 
        gameState={gameState}
        onStart={startGame}
        onReset={resetGame}
      />
    </div>
  );
};

export default TapRaceGame;
