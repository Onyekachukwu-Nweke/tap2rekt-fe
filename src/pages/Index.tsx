
import { useState } from 'react';
import GameHub from '@/components/GameHub';
import LightningReflexGame from '@/components/LightningReflexGame';
import Leaderboard from '@/components/Leaderboard';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Trophy, Users, Gamepad2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Gorbagana Arena
              </h1>
              <p className="text-xs text-purple-300">Solana Testnet Gaming</p>
            </div>
          </div>
          <WalletConnection />
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-purple-500/20 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Games: {playerStats.gamesPlayed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">Wins: {playerStats.totalWins}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300">Best: {playerStats.bestScore}ms</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Testnet Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'hub' && (
          <GameHub 
            onSelectGame={(game) => setCurrentView(game)}
            playerStats={playerStats}
          />
        )}
        
        {currentView === 'lightning-reflex' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hub')}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                ← Back to Hub
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView('leaderboard')}
                className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </div>
            <LightningReflexGame onGameComplete={updateStats} />
          </div>
        )}

        {currentView === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hub')}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                ← Back to Hub
              </Button>
            </div>
            <Leaderboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/20 backdrop-blur-md mt-20">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-purple-300 text-sm mb-2">
            Built on Gorbagana Testnet • Zero-MEV • Instant Finality
          </p>
          <p className="text-purple-500 text-xs">
            From trash chain to treasure - powered by the community
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
