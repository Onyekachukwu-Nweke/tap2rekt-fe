
import { Users } from 'lucide-react';

interface PlayerStatsProps {
  tapCount: number;
}

export const PlayerStats = ({ tapCount }: PlayerStatsProps) => {
  return (
    <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <Users className="w-8 h-8 text-white" />
      </div>
      <div className="text-lg font-bold text-purple-300">You</div>
      <div className="text-3xl font-bold text-white">{tapCount}</div>
      <div className="text-sm text-slate-400">Taps</div>
    </div>
  );
};
