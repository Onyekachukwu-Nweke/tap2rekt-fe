
import { useState } from 'react';
import TapRaceHub from '@/components/TapRaceHub';
import TapRaceGame from '@/components/TapRaceGame';
import TapRaceLeaderboard from '@/components/TapRaceLeaderboard';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { Zap, Trophy, Target, Timer } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState('hub');
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    totalWins: 0,
    totalEarnings: 0
  });

  const updateStats = (score: number, won: boolean, earnings: number = 0) => {
    setPlayerStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      bestScore: Math.max(prev.bestScore, score),
      totalWins: prev.totalWins + (won ? 1 : 0),
      totalEarnings: prev.totalEarnings + earnings
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Sophisticated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-gradient-to-r from-indigo-600/15 to-purple-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-40 w-72 h-72 bg-gradient-to-r from-amber-500/10 to-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-slate-700/5 via-purple-700/5 to-indigo-700/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '30s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full">
                <Zap className="w-3 h-3 text-white ml-0.5 mt-0.5" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 via-purple-100 to-indigo-200 bg-clip-text text-transparent">
                Tap 2 Rekt
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                🚀 Gorbagana Testnet • 1v1 Speed Battles • Winner Takes All ⚡
              </p>
            </div>
          </div>
          <WalletConnection />
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-slate-700/30 bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-slate-200 font-semibold">Battles: {playerStats.gamesPlayed}</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-slate-200 font-semibold">Wins: {playerStats.totalWins}</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Timer className="w-5 h-5 text-indigo-400" />
                <span className="text-slate-200 font-semibold">Best: {playerStats.bestScore} taps</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-200 font-semibold">Earned: {playerStats.totalEarnings} GORB</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-emerald-900/40 border border-emerald-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-bold">🔥 TAP RACE LIVE 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {currentView === 'hub' && (
          <TapRaceHub 
            onCreateMatch={() => setCurrentView('game')}
            onJoinMatch={() => setCurrentView('game')}
            onViewLeaderboard={() => setCurrentView('leaderboard')}
            playerStats={playerStats}
          />
        )}
        
        {currentView === 'game' && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hub')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm"
              >
                ← Back to Hub
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView('leaderboard')}
                className="border-amber-600/50 text-amber-300 hover:bg-amber-900/30 bg-slate-800/50 backdrop-blur-sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </div>
            <TapRaceGame onGameComplete={updateStats} />
          </div>
        )}

        {currentView === 'leaderboard' && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hub')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm"
              >
                ← Back to Hub
              </Button>
            </div>
            <TapRaceLeaderboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-slate-900/60 backdrop-blur-xl mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <p className="text-xl font-bold bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              🎯 Tap 2 Rekt - Gorbagana Testnet 🎯
            </p>
            <p className="text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
              ⚡ 1v1 Speed Battles • Winner Takes All ⚡
            </p>
          </div>
          <p className="text-slate-400 text-sm mb-4 font-medium">
            Fast taps, faster transactions - powered by Gorbagana 💎
          </p>
          <div className="flex justify-center space-x-3 text-xs">
            <span className="bg-slate-800/60 border border-slate-600/30 px-4 py-2 rounded-full text-slate-300">
              🎮 1v1 Battles
            </span>
            <span className="bg-slate-800/60 border border-slate-600/30 px-4 py-2 rounded-full text-slate-300">
              ⚡ Real-time Gaming
            </span>
            <span className="bg-slate-800/60 border border-slate-600/30 px-4 py-2 rounded-full text-slate-300">
              🏆 GORB Rewards
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
