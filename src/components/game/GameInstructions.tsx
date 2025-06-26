
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

export const GameInstructions = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-400" />
          Practice Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="font-semibold text-purple-400 mb-2">1. Get Ready</div>
            <div>3-second countdown to prepare</div>
          </div>
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="font-semibold text-amber-400 mb-2">2. Tap Fast</div>
            <div>Click/tap as fast as possible for 10 seconds</div>
          </div>
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="font-semibold text-emerald-400 mb-2">3. Practice</div>
            <div>Build your speed for real battles!</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
