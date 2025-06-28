
import { useState, useEffect } from 'react';
import TapRaceHub from '@/components/TapRaceHub';
import TapRaceGame from '@/components/TapRaceGame';
import TapRaceLeaderboard from '@/components/TapRaceLeaderboard';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { Zap, Trophy, Target, Timer } from 'lucide-react';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import { useMatches } from '@/hooks/useMatches';

const Index = () => {
  const [currentView, setCurrentView] = useState('hub');
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    totalWins: 0,
    totalEarnings: 0
  });
  
  const { walletAddress, isConnected } = useWalletAddress();
  const { getPlayerStats } = useMatches();

  // Load real player stats from database only when wallet is connected
  useEffect(() => {
    const loadPlayerStats = async () => {
      if (walletAddress && isConnected) {
        const stats = await getPlayerStats(walletAddress);
        if (stats) {
          setPlayerStats({
            gamesPlayed: stats.total_battles,
            bestScore: stats.best_tap_count,
            totalWins: stats.total_victories,
            totalEarnings: 0 // We don't track earnings yet
          });
        }
      } else {
        // Reset stats when wallet is disconnected
        setPlayerStats({
          gamesPlayed: 0,
          bestScore: 0,
          totalWins: 0,
          totalEarnings: 0
        });
      }
    };

    loadPlayerStats();
  }, [walletAddress, isConnected, getPlayerStats]);

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
        <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full">
                <Zap className="w-2 h-2 md:w-3 md:h-3 text-white ml-0.5 mt-0.5" />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-slate-100 via-purple-100 to-indigo-200 bg-clip-text text-transparent">
                Tap 2 Rekt
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium hidden sm:block">
                🚀 Gorbagana Testnet • 1v1 Speed Battles • Winner Takes All ⚡
              </p>
              <p className="text-xs text-slate-400 font-medium sm:hidden">
                🚀 1v1 Speed Battles ⚡
              </p>
            </div>
          </div>
          <WalletConnection />
        </div>
      </header>

      {/* Stats Bar - Only show when wallet is connected */}
      {isConnected && (
        <div className="border-b border-slate-700/30 bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-xl relative z-10">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center space-x-2 md:space-x-8 overflow-x-auto">
                <div className="flex items-center space-x-2 md:space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-3 py-1 md:px-4 md:py-2 backdrop-blur-sm whitespace-nowrap">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  <span className="text-slate-200 font-semibold">Battles: {playerStats.gamesPlayed}</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-3 py-1 md:px-4 md:py-2 backdrop-blur-sm whitespace-nowrap">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                  <span className="text-slate-200 font-semibold">Wins: {playerStats.totalWins}</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 md:space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-3 py-1 md:px-4 md:py-2 backdrop-blur-sm whitespace-nowrap">
                  <Timer className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                  <span className="text-slate-200 font-semibold">Best: {playerStats.bestScore}</span>
                </div>
                <div className="hidden md:flex items-center space-x-2 md:space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-3 py-1 md:px-4 md:py-2 backdrop-blur-sm whitespace-nowrap">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                  <span className="text-slate-200 font-semibold">Win Rate: {playerStats.gamesPlayed > 0 ? Math.round((playerStats.totalWins / playerStats.gamesPlayed) * 100) : 0}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 bg-emerald-900/40 border border-emerald-600/30 rounded-full px-3 py-1 md:px-4 md:py-2 backdrop-blur-sm">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-xs md:text-sm font-bold hidden sm:block">🔥 TAP RACE LIVE 🔥</span>
                <span className="text-emerald-300 text-xs font-bold sm:hidden">🔥 LIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        {currentView === 'hub' && (
          <div className="space-y-8">
            <TapRaceHub 
              onCreateMatch={() => {
                // Navigation handled by hub itself through react-router
              }}
              onJoinMatch={() => {
                // Navigation handled by hub itself through react-router
              }}
              onViewLeaderboard={() => setCurrentView('leaderboard')}
              onPracticeMode={() => setCurrentView('practice')}
              playerStats={playerStats}
            />
          </div>
        )}
        
        {currentView === 'practice' && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hub')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm w-full sm:w-auto"
              >
                ← Back to Hub
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView('leaderboard')}
                className="border-amber-600/50 text-amber-300 hover:bg-amber-900/30 bg-slate-800/50 backdrop-blur-sm w-full sm:w-auto"
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
            <div className="mb-4 md:mb-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hub')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm w-full sm:w-auto"
              >
                ← Back to Hub
              </Button>
            </div>
            <TapRaceLeaderboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-slate-900/60 backdrop-blur-xl mt-10 md:mt-20 relative z-10">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
          <div className="mb-4">
            <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              🎯 Tap 2 Rekt - Gorbagana Testnet 🎯
            </p>
            <p className="text-base md:text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
              ⚡ 1v1 Speed Battles • Winner Takes All ⚡
            </p>
          </div>
          <p className="text-slate-400 text-sm mb-4 font-medium">
            Fast taps, faster transactions - powered by Gorbagana 💎
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-xs">
            <span className="bg-slate-800/60 border border-slate-600/30 px-3 py-1 md:px-4 md:py-2 rounded-full text-slate-300">
              🎮 1v1 Battles
            </span>
            <span className="bg-slate-800/60 border border-slate-600/30 px-3 py-1 md:px-4 md:py-2 rounded-full text-slate-300">
              ⚡ Real-time Gaming
            </span>
            <span className="bg-slate-800/60 border border-slate-600/30 px-3 py-1 md:px-4 md:py-2 rounded-full text-slate-300">
              🏆 GOR Rewards
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
