
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

interface GameAreaProps {
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  onTap: () => void;
}

export const GameArea = ({ gameState, onTap }: GameAreaProps) => {
  const isActive = gameState === 'active';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Button
          onClick={onTap}
          disabled={!isActive}
          className={`
            w-24 h-24 md:w-32 md:h-32 rounded-full text-xl md:text-2xl font-bold transition-all duration-200 transform
            ${isActive 
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 hover:scale-110 shadow-2xl shadow-red-500/50 animate-pulse' 
              : 'bg-gradient-to-br from-slate-600 to-slate-700 cursor-not-allowed'
            }
          `}
        >
          <Target className="w-8 h-8 md:w-12 md:h-12" />
        </Button>
        
        {isActive && (
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"></div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-base md:text-lg font-bold text-white">
          {isActive ? 'TAP NOW!' : 'Get Ready...'}
        </div>
        <div className="text-xs md:text-sm text-slate-400">
          {isActive ? 'Click as fast as you can!' : 'Wait for the game to start'}
        </div>
      </div>
    </div>
  );
};
