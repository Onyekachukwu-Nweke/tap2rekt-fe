
import { Badge } from '@/components/ui/badge';
import { Timer, Zap, Users } from 'lucide-react';

interface GameStateDisplayProps {
  gameState: 'waiting' | 'countdown' | 'active' | 'finished';
  countdownTime: number;
  gameTime: number;
  myTaps: number;
  opponentTaps: number;
  walletAddress: string;
  winner?: string;
  submissionStatus: 'idle' | 'submitting' | 'submitted' | 'failed';
  onTap: () => void;
}

export const WebSocketGameState = ({
  gameState,
  countdownTime,
  gameTime,
  myTaps,
  opponentTaps,
  walletAddress,
  winner,
  submissionStatus,
  onTap
}: GameStateDisplayProps) => {
  const getGameStateDisplay = () => {
    switch (gameState) {
      case 'waiting':
        return {
          title: '⏳ Connecting...',
          subtitle: 'Establishing WebSocket connection',
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
          subtitle: `${gameTime}s remaining`,
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          textColor: 'text-white'
        };
      case 'finished':
        const isWinner = winner === walletAddress;
        
        if (winner) {
          return {
            title: isWinner ? '🎉 Victory!' : '💀 Defeat',
            subtitle: `Your score: ${myTaps} taps`,
            bgColor: isWinner 
              ? 'bg-gradient-to-br from-emerald-500 to-green-600'
              : 'bg-gradient-to-br from-red-500 to-pink-600',
            textColor: 'text-white'
          };
        }
        
        let title = '';
        if (submissionStatus === 'submitting') {
          title = '⏳ Submitting...';
        } else if (submissionStatus === 'failed') {
          title = '⚠️ Submission Failed';
        } else if (submissionStatus === 'submitted') {
          title = '✅ Score Submitted';
        } else {
          title = 'Game Complete!';
        }
        
        return {
          title,
          subtitle: `Your score: ${myTaps} taps`,
          bgColor: submissionStatus === 'failed' 
            ? 'bg-gradient-to-br from-red-500 to-pink-600'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600',
          textColor: 'text-white'
        };
    }
  };

  const stateDisplay = getGameStateDisplay();

  return (
    <div 
      className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
      onClick={gameState === 'active' ? onTap : undefined}
    >
      {/* Tap Effects */}
      {gameState === 'active' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full animate-ping"></div>
        </div>
      )}
      
      <div className="text-4xl md:text-6xl font-bold mb-4">{stateDisplay.title}</div>
      <div className="text-lg md:text-xl mb-4 text-center px-4">{stateDisplay.subtitle}</div>
      
      {gameState === 'active' && (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm md:text-lg px-4">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Timer className="w-4 h-4 md:w-5 md:h-5" />
            <span>Time: {gameTime}s</span>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <Zap className="w-4 h-4 md:w-5 md:h-5" />
            <span>You: {myTaps}</span>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span>Opponent: {opponentTaps}</span>
          </div>
        </div>
      )}
    </div>
  );
};
