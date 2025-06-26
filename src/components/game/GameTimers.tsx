
import { useEffect } from 'react';

interface GameTimersProps {
  gameState: 'lobby' | 'countdown' | 'active' | 'finished';
  timeLeft: number;
  countdownTime: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  setCountdownTime: (value: number | ((prev: number) => number)) => void;
  setGameState: (state: 'lobby' | 'countdown' | 'active' | 'finished') => void;
  onGameEnd: () => void;
}

export const useGameTimers = ({
  gameState,
  timeLeft,
  countdownTime,
  setTimeLeft,
  setCountdownTime,
  setGameState,
  onGameEnd
}: GameTimersProps) => {
  // Game timer
  useEffect(() => {
    if (gameState === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState === 'active' && timeLeft === 0) {
      onGameEnd();
    }
  }, [gameState, timeLeft, setTimeLeft, onGameEnd]);

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
  }, [gameState, countdownTime, setCountdownTime, setGameState]);
};
