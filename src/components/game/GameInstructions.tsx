
import { Target, Zap, Trophy } from 'lucide-react';

export const GameInstructions = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/50 rounded-xl p-6 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
        How to Play
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-slate-200">1. Get Ready</h3>
          <p className="text-sm text-slate-400">
            Wait for the countdown to finish
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-slate-200">2. Tap Fast</h3>
          <p className="text-sm text-slate-400">
            Click the target as many times as possible
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-slate-200">3. Beat Your Best</h3>
          <p className="text-sm text-slate-400">
            Try to get the highest score possible
          </p>
        </div>
      </div>
    </div>
  );
};
