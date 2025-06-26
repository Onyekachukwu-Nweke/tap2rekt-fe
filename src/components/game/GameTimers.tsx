
import { Clock, Timer } from 'lucide-react';

interface GameTimersProps {
  gameState: 'lobby' | 'countdown' | 'active' | 'finished';
  countdownTime: number;
  timeLeft: number;
}

export const GameTimers = ({ gameState, countdownTime, timeLeft }: GameTimersProps) => {
  if (gameState === 'lobby') {
    return null;
  }

  return (
    <div className="flex justify-center space-x-8">
      {gameState === 'countdown' && (
        <div className="text-center bg-orange-900/40 border border-orange-600/30 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{countdownTime}</div>
          <div className="text-sm text-orange-300">Starting...</div>
        </div>
      )}

      {gameState === 'active' && (
        <div className="text-center bg-green-900/40 border border-green-600/30 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{timeLeft}</div>
          <div className="text-sm text-green-300">Seconds Left</div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center bg-emerald-900/40 border border-emerald-600/30 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">Done!</div>
          <div className="text-sm text-emerald-300">Game Complete</div>
        </div>
      )}
    </div>
  );
};
