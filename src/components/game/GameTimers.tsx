
import { Clock, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GameTimersProps {
  gameState: 'loading' | 'countdown' | 'active' | 'finished';
  countdownTime: number;
  timeLeft: number;
}

export const GameTimers = ({ gameState, countdownTime, timeLeft }: GameTimersProps) => {
  if (gameState === 'countdown') {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-amber-400">
            <Clock className="w-5 h-5" />
            <span className="text-lg font-bold">
              Starting in {countdownTime}...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'active') {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-emerald-400">
            <Timer className="w-5 h-5" />
            <span className="text-lg font-bold">
              {timeLeft}s remaining
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
