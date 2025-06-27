
import { Button } from '@/components/ui/button';
import { Zap, Trophy } from 'lucide-react';

interface GameControlsProps {
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  onStart: () => void;
  onReset: () => void;
}

export const GameControls = ({ gameState, onStart, onReset }: GameControlsProps) => {
  return (
    <div className="flex justify-center space-x-4">
      {gameState === 'waiting' && (
        <Button 
          onClick={onStart}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-bold px-8 py-4"
        >
          <Zap className="w-5 h-5 mr-2" />
          Start Practice!
        </Button>
      )}
      
      {gameState === 'finished' && (
        <div className="flex space-x-4">
          <Button 
            onClick={onReset}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-bold px-8 py-4"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Practice Again
          </Button>
        </div>
      )}
    </div>
  );
};
