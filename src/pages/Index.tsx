
import { useState } from 'react';
import GameHub from '@/components/GameHub';
import LightningReflexGame from '@/components/LightningReflexGame';
import Leaderboard from '@/components/Leaderboard';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Trophy, Users, Gamepad2, Sparkles } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState('hub');
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    totalWins: 0
  });

  const updateStats = (score: number, won: boolean) => {
    setPlayerStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      bestScore: Math.max(prev.bestScore, score),
      totalWins: prev.totalWins + (won ? 1 : 0)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Sophisticated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-gradient-to-r from-violet-600/15 to-purple-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-40 w-72 h-72 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-slate-700/5 via-blue-700/5 to-indigo-700/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '30s' }}></div>
      </div>

      {/* Elegant floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full">
                <Sparkles className="w-3 h-3 text-white ml-0.5 mt-0.5" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                Gorbagana Arena
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                🚀 Solana Testnet Gaming • Zero-MEV • Lightning Fast ⚡
              </p>
            </div>
          </div>
          <WalletConnection />
        </div>
      </header>

      {/* Refined Stats Bar */}
      <div className="border-b border-slate-700/30 bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Gamepad2 className="w-5 h-5 text-blue-400" />
                <span className="text-slate-200 font-semibold">Games: {playerStats.gamesPlayed}</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-slate-200 font-semibold">Wins: {playerStats.totalWins}</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-slate-200 font-semibold">Best: {playerStats.bestScore}ms</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-emerald-900/40 border border-emerald-600/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-bold">🔥 TESTNET LIVE 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {currentView === 'hub' && (
          <GameHub 
            onSelectGame={(game) => setCurrentView(game)}
            playerStats={playerStats}
          />
        )}
        
        {currentView === 'lightning-reflex' && (
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
            <LightningReflexGame onGameComplete={updateStats} />
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
            <Leaderboard />
          </div>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="border-t border-slate-700/30 bg-slate-900/60 backdrop-blur-xl mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <p className="text-xl font-bold bg-gradient-to-r from-slate-200 to-blue-200 bg-clip-text text-transparent">
              🌟 Built on Gorbagana Testnet 🌟
            </p>
            <p className="text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
              ⚡ Zero-MEV • Instant Finality • Web2 Speed ⚡
            </p>
          </div>
          <p className="text-slate-400 text-sm mb-4 font-medium">
            From trash chain to treasure - powered by the community 💎
          </p>
          <div className="flex justify-center space-x-3 text-xs">
            <span className="bg-slate-800/60 border border-slate-600/30 px-4 py-2 rounded-full text-slate-300">
              🎮 Multiplayer Gaming
            </span>
            <span className="bg-slate-800/60 border border-slate-600/30 px-4 py-2 rounded-full text-slate-300">
              ⚡ Lightning Fast
            </span>
            <span className="bg-slate-800/60 border border-slate-600/30 px-4 py-2 rounded-full text-slate-300">
              🏆 Competitive
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
