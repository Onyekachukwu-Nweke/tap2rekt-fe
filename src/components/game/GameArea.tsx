
import { Timer, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GameAreaProps {
  gameState: 'lobby' | 'countdown' | 'active' | 'finished';
  stateDisplay: {
    title: string;
    subtitle: string;
    bgColor: string;
    textColor: string;
  };
  timeLeft: number;
  tapCount: number;
  onTap: () => void;
}

export const GameArea = ({ gameState, stateDisplay, timeLeft, tapCount, onTap }: GameAreaProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-0">
        <div 
          className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
          onClick={onTap}
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
  );
};
