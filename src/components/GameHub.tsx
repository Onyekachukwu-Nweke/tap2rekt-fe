
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Clock, Star, Play, Trophy, Target } from 'lucide-react';

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
      color: 'from-yellow-500 to-orange-500'
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
      color: 'from-purple-500 to-pink-500'
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
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Welcome to the Arena
        </h2>
        <p className="text-xl text-purple-200 max-w-2xl mx-auto">
          Experience lightning-fast multiplayer gaming on Gorbagana's zero-MEV testnet. 
          Compete, earn, and prove your skills!
        </p>
      </div>

      {/* Player Stats Card */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Your Arena Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-300">{playerStats.gamesPlayed}</div>
              <div className="text-sm text-purple-400">Games Played</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-300">{playerStats.totalWins}</div>
              <div className="text-sm text-cyan-400">Victories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-300">
                {playerStats.bestScore > 0 ? `${playerStats.bestScore}ms` : '-'}
              </div>
              <div className="text-sm text-yellow-400">Best Reaction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card 
            key={game.id} 
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${game.color}`}>
                  <game.icon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  variant={game.status === 'live' ? 'default' : 'secondary'}
                  className={game.status === 'live' ? 'bg-green-500 text-white' : ''}
                >
                  {game.status === 'live' ? 'Live' : 'Soon'}
                </Badge>
              </div>
              <CardTitle className="text-white">{game.title}</CardTitle>
              <CardDescription className="text-slate-300">
                {game.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-slate-400">
                  <Users className="w-4 h-4 mr-1" />
                  {game.players} players
                </div>
                <div className="flex items-center text-slate-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {game.duration}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Rewards</div>
                  <div className="text-sm font-semibold text-green-400">{game.rewards}</div>
                </div>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {game.difficulty}
                </Badge>
              </div>

              <Button 
                className={`w-full ${
                  game.status === 'live' 
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
                onClick={() => game.status === 'live' && onSelectGame(game.id)}
                disabled={game.status !== 'live'}
              >
                <Play className="w-4 h-4 mr-2" />
                {game.status === 'live' ? 'Play Now' : 'Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameHub;
