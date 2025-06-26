
interface GameStateDisplayProps {
  gameState: 'lobby' | 'countdown' | 'active' | 'finished';
  countdownTime: number;
  timeLeft: number;
  tapCount: number;
}

export const getGameStateDisplay = ({ gameState, countdownTime, timeLeft, tapCount }: GameStateDisplayProps) => {
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
