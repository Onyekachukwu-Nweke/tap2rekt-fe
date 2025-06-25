
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Clock, Star, Play, Trophy, Target, Sparkles, Flame, Crown } from 'lucide-react';

interface GameHubProps {
  onSelectGame: (gameId: string) => void;
  playerStats: {
    gamesPlayed: number;
    bestScore: number;
    totalWins: number;
  };
}

const GameHub = ({ onSelectGame, playerStats }: GameHubProps) => {
  const games = [
    {
      id: 'lightning-reflex',
      title: 'Lightning Reflexes',
      description: 'Test your reaction time in this fast-paced challenge. Click when the screen flashes!',
      difficulty: 'Easy',
      players: '1-8',
      duration: '30s',
      rewards: '10-50 GORB',
      icon: Zap,
      status: 'live',
      color: 'from-yellow-400 via-orange-500 to-red-500',
      shadow: 'shadow-yellow-500/50',
      border: 'border-yellow-500/50'
    },
    {
      id: 'memory-maze',
      title: 'Memory Maze',
      description: 'Navigate through patterns and sequences. Remember the path to victory!',
      difficulty: 'Medium',
      players: '1-4',
      duration: '2m',
      rewards: '25-100 GORB',
      icon: Target,
      status: 'coming-soon',
      color: 'from-purple-400 via-pink-500 to-rose-500',
      shadow: 'shadow-purple-500/50',
      border: 'border-purple-500/50'
    },
    {
      id: 'speed-trader',
      title: 'Speed Trader',
      description: 'Buy low, sell high in this fast-paced trading simulation!',
      difficulty: 'Hard',
      players: '2-10',
      duration: '5m',
      rewards: '50-250 GORB',
      icon: Trophy,
      status: 'coming-soon',
      color: 'from-cyan-400 via-blue-500 to-indigo-500',
      shadow: 'shadow-cyan-500/50',
      border: 'border-cyan-500/50'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="w-96 h-96 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative">
          <h2 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent animate-pulse mb-4">
            🏟️ Welcome to the Arena 🏟️
          </h2>
          <div className="flex justify-center space-x-4 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            <Crown className="w-6 h-6 text-purple-400 animate-bounce delay-500" />
          </div>
          <p className="text-2xl text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 bg-clip-text max-w-4xl mx-auto font-semibold leading-relaxed">
            Experience lightning-fast multiplayer gaming on Gorbagana's zero-MEV testnet. 
            Compete, earn, and prove your skills in the most lit gaming experience! 🚀
          </p>
        </div>
      </div>

      {/* Enhanced Player Stats Card */}
      <Card className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-cyan-900/60 border-gradient-to-r border-purple-500/50 backdrop-blur-xl shadow-2xl shadow-purple-500/25 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse"></div>
        <CardHeader className="relative">
          <CardTitle className="text-2xl text-transparent bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text flex items-center">
            <Star className="w-7 h-7 mr-3 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
            Your Arena Stats
            <Sparkles className="w-5 h-5 ml-3 text-pink-400 animate-bounce" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl p-4 backdrop-blur-sm border border-purple-500/30">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">{playerStats.gamesPlayed}</div>
              <div className="text-sm text-purple-300 font-semibold">Games Played</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-xl p-4 backdrop-blur-sm border border-cyan-500/30">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">{playerStats.totalWins}</div>
              <div className="text-sm text-cyan-300 font-semibold">Victories 🏆</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl p-4 backdrop-blur-sm border border-yellow-500/30">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
                {playerStats.bestScore > 0 ? `${playerStats.bestScore}ms` : '-'}
              </div>
              <div className="text-sm text-yellow-300 font-semibold">Best Reaction ⚡</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <Card 
            key={game.id} 
            className={`bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 ${game.border} hover:border-opacity-100 transition-all duration-500 hover:scale-105 hover:rotate-1 backdrop-blur-xl ${game.shadow} hover:shadow-2xl relative overflow-hidden group`}
          >
            {/* Animated background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <CardHeader className="pb-3 relative">
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${game.color} shadow-xl animate-pulse`}>
                  <game.icon className="w-8 h-8 text-white" />
                </div>
                <Badge 
                  variant={game.status === 'live' ? 'default' : 'secondary'}
                  className={game.status === 'live' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-lg shadow-green-500/50' 
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300'
                  }
                >
                  {game.status === 'live' ? '🔴 LIVE' : '⏳ Soon'}
                </Badge>
              </div>
              <CardTitle className="text-xl text-white font-bold">{game.title}</CardTitle>
              <CardDescription className="text-slate-200 leading-relaxed">
                {game.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-slate-300 bg-slate-800/50 rounded-lg p-2">
                  <Users className="w-4 h-4 mr-2 text-purple-400" />
                  {game.players} players
                </div>
                <div className="flex items-center text-slate-300 bg-slate-800/50 rounded-lg p-2">
                  <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                  {game.duration}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-3 border border-green-500/30">
                  <div className="text-xs text-green-400 font-semibold">Rewards 💰</div>
                  <div className="text-sm font-bold text-green-300">{game.rewards}</div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${game.border} text-slate-200 bg-slate-800/50 font-semibold`}
                >
                  {game.difficulty}
                </Badge>
              </div>

              <Button 
                className={`w-full text-lg font-bold py-6 ${
                  game.status === 'live' 
                    ? `bg-gradient-to-r ${game.color} hover:shadow-2xl hover:shadow-${game.color.split('-')[1]}-500/50 transform hover:scale-105 transition-all duration-300` 
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                onClick={() => game.status === 'live' && onSelectGame(game.id)}
                disabled={game.status !== 'live'}
              >
                <Play className="w-5 h-5 mr-3" />
                {game.status === 'live' ? '🎮 PLAY NOW!' : '⏳ Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action Section */}
      <div className="text-center bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-cyan-900/40 rounded-3xl p-8 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/25">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          🚀 Ready to Dominate? 🚀
        </h3>
        <p className="text-xl text-purple-200 mb-6">
          Join thousands of players competing for glory and GORB tokens!
        </p>
        <div className="flex justify-center space-x-4">
          <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full text-green-300 border border-green-500/30 font-semibold">
            💎 100% Fair
          </span>
          <span className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full text-yellow-300 border border-yellow-500/30 font-semibold">
            ⚡ Zero MEV
          </span>
          <span className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 px-4 py-2 rounded-full text-pink-300 border border-pink-500/30 font-semibold">
            🏆 Instant Rewards
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
