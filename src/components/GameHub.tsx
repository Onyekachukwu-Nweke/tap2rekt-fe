
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Clock, Star, Play, Trophy, Target, Sparkles, Crown } from 'lucide-react';

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
      color: 'from-amber-500 to-yellow-600',
      shadow: 'shadow-amber-500/25',
      border: 'border-amber-500/40'
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
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/25',
      border: 'border-violet-500/40'
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
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/25',
      border: 'border-blue-500/40'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="w-80 h-80 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-100 via-blue-200 to-indigo-200 bg-clip-text text-transparent mb-4">
            🏟️ Welcome to the Arena 🏟️
          </h2>
          <div className="flex justify-center space-x-4 mb-6">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <Zap className="w-6 h-6 text-blue-400" />
            <Crown className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto font-medium leading-relaxed">
            Experience lightning-fast multiplayer gaming on Gorbagana's zero-MEV testnet. 
            Compete, earn, and prove your skills in the most sophisticated gaming experience! 🚀
          </p>
        </div>
      </div>

      {/* Enhanced Player Stats Card */}
      <Card className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl shadow-slate-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <CardHeader className="relative">
          <CardTitle className="text-2xl text-slate-200 flex items-center">
            <Star className="w-7 h-7 mr-3 text-amber-400" />
            Your Arena Stats
            <Sparkles className="w-5 h-5 ml-3 text-blue-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-300">{playerStats.gamesPlayed}</div>
              <div className="text-sm text-slate-400 font-semibold">Games Played</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-amber-300">{playerStats.totalWins}</div>
              <div className="text-sm text-slate-400 font-semibold">Victories 🏆</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-indigo-300">
                {playerStats.bestScore > 0 ? `${playerStats.bestScore}ms` : '-'}
              </div>
              <div className="text-sm text-slate-400 font-semibold">Best Reaction ⚡</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <Card 
            key={game.id} 
            className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 ${game.border} hover:border-opacity-80 transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl ${game.shadow} hover:shadow-lg relative overflow-hidden group`}
          >
            {/* Subtle background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <CardHeader className="pb-3 relative">
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${game.color} shadow-lg`}>
                  <game.icon className="w-8 h-8 text-white" />
                </div>
                <Badge 
                  variant={game.status === 'live' ? 'default' : 'secondary'}
                  className={game.status === 'live' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                    : 'bg-slate-700 text-slate-300'
                  }
                >
                  {game.status === 'live' ? '🔴 LIVE' : '⏳ Soon'}
                </Badge>
              </div>
              <CardTitle className="text-xl text-slate-100 font-bold">{game.title}</CardTitle>
              <CardDescription className="text-slate-300 leading-relaxed">
                {game.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-slate-300 bg-slate-700/40 border border-slate-600/30 rounded-lg p-2">
                  <Users className="w-4 h-4 mr-2 text-blue-400" />
                  {game.players} players
                </div>
                <div className="flex items-center text-slate-300 bg-slate-700/40 border border-slate-600/30 rounded-lg p-2">
                  <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                  {game.duration}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="bg-emerald-900/40 border border-emerald-600/30 rounded-lg p-3">
                  <div className="text-xs text-emerald-400 font-semibold">Rewards 💰</div>
                  <div className="text-sm font-bold text-emerald-300">{game.rewards}</div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${game.border} text-slate-200 bg-slate-700/40 font-semibold`}
                >
                  {game.difficulty}
                </Badge>
              </div>

              <Button 
                className={`w-full text-lg font-bold py-6 ${
                  game.status === 'live' 
                    ? `bg-gradient-to-r ${game.color} hover:shadow-xl hover:shadow-${game.color.split('-')[1]}-500/30 transform hover:scale-[1.02] transition-all duration-300` 
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
      <div className="text-center bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-600/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-slate-900/50">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-blue-200 bg-clip-text text-transparent mb-4">
          🚀 Ready to Dominate? 🚀
        </h3>
        <p className="text-xl text-slate-300 mb-6">
          Join thousands of players competing for glory and GORB tokens!
        </p>
        <div className="flex justify-center space-x-4">
          <span className="bg-emerald-900/40 border border-emerald-600/30 px-4 py-2 rounded-full text-emerald-300 font-semibold">
            💎 100% Fair
          </span>
          <span className="bg-amber-900/40 border border-amber-600/30 px-4 py-2 rounded-full text-amber-300 font-semibold">
            ⚡ Zero MEV
          </span>
          <span className="bg-blue-900/40 border border-blue-600/30 px-4 py-2 rounded-full text-blue-300 font-semibold">
            🏆 Instant Rewards
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
