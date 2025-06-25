
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 via-blue-900 to-cyan-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/25 to-blue-500/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-40 w-80 h-80 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 bg-black/30 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center animate-pulse shadow-2xl shadow-purple-500/50">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce">
                <Sparkles className="w-3 h-3 text-white ml-0.5 mt-0.5" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                Gorbagana Arena
              </h1>
              <p className="text-sm text-transparent bg-gradient-to-r from-pink-300 to-cyan-300 bg-clip-text font-semibold">
                🚀 Solana Testnet Gaming • Zero-MEV • Lightning Fast ⚡
              </p>
            </div>
          </div>
          <WalletConnection />
        </div>
      </header>

      {/* Enhanced Stats Bar */}
      <div className="border-b border-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-cyan-900/30 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <Gamepad2 className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-purple-200 font-semibold">Games: {playerStats.gamesPlayed}</span>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-cyan-200 font-semibold">Wins: {playerStats.totalWins}</span>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-yellow-200 font-semibold">Best: {playerStats.bestScore}ms</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping"></div>
              <span className="text-green-300 text-sm font-bold">🔥 TESTNET LIVE 🔥</span>
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
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/25"
              >
                ← Back to Hub
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView('leaderboard')}
                className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 backdrop-blur-sm shadow-lg shadow-cyan-500/25"
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
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm shadow-lg shadow-purple-500/25"
              >
                ← Back to Hub
              </Button>
            </div>
            <Leaderboard />
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-cyan-900/30 backdrop-blur-xl mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <p className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              🌟 Built on Gorbagana Testnet 🌟
            </p>
            <p className="text-lg bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-semibold">
              ⚡ Zero-MEV • Instant Finality • Web2 Speed ⚡
            </p>
          </div>
          <p className="text-purple-300 text-sm mb-2 font-medium">
            From trash chain to treasure - powered by the community 💎
          </p>
          <div className="flex justify-center space-x-2 text-xs">
            <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full text-purple-300 border border-purple-500/30">
              🎮 Multiplayer Gaming
            </span>
            <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 rounded-full text-cyan-300 border border-cyan-500/30">
              ⚡ Lightning Fast
            </span>
            <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full text-green-300 border border-green-500/30">
              🏆 Competitive
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
