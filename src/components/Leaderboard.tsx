
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Zap, Crown } from 'lucide-react';

const Leaderboard = () => {
  // Mock leaderboard data - in real app this would come from Gorbagana testnet
  const leaderboardData = [
    { rank: 1, player: 'DegenKing', score: 187, games: 23, winRate: 87, rewards: 1250 },
    { rank: 2, player: 'FastFingers', score: 203, games: 31, winRate: 74, rewards: 980 },
    { rank: 3, player: 'LightningLord', score: 218, games: 19, winRate: 89, rewards: 850 },
    { rank: 4, player: 'ReflexRuler', score: 234, games: 27, winRate: 68, rewards: 720 },
    { rank: 5, player: 'SpeedDemon', score: 256, games: 15, winRate: 93, rewards: 650 },
    { rank: 6, player: 'QuickDraw', score: 267, games: 42, winRate: 61, rewards: 580 },
    { rank: 7, player: 'RapidFire', score: 289, games: 18, winRate: 78, rewards: 520 },
    { rank: 8, player: 'FlashPoint', score: 301, games: 25, winRate: 72, rewards: 480 },
    { rank: 9, player: 'BoltMaster', score: 318, games: 33, winRate: 64, rewards: 420 },
    { rank: 10, player: 'StormRider', score: 334, games: 21, winRate: 76, rewards: 380 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Award className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-amber-600/50';
      default:
        return 'bg-slate-800/50 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
            Lightning Reflexes Leaderboard
          </CardTitle>
          <p className="text-purple-200">
            Top players competing on the Gorbagana testnet. Rankings update in real-time!
          </p>
        </CardHeader>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {leaderboardData.slice(0, 3).map((player) => (
          <Card 
            key={player.rank} 
            className={`${getRankStyle(player.rank)} relative overflow-hidden`}
          >
            <CardContent className="p-6 text-center">
              <div className="absolute top-2 right-2">
                {getRankIcon(player.rank)}
              </div>
              <div className="text-3xl font-bold mb-2">#{player.rank}</div>
              <div className="text-lg font-semibold text-white mb-2">{player.player}</div>
              <div className="text-2xl font-bold text-cyan-400 mb-1">{player.score}ms</div>
              <div className="text-sm text-slate-300">Average Time</div>
              <div className="mt-3 flex justify-center">
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  {player.rewards} GORB
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-purple-400" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((player) => (
              <div 
                key={player.rank}
                className={`${getRankStyle(player.rank)} p-4 rounded-lg flex items-center justify-between`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(player.rank)}
                    <span className="text-xl font-bold text-white">#{player.rank}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{player.player}</div>
                    <div className="text-sm text-slate-400">
                      {player.games} games • {player.winRate}% win rate
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <div className="text-lg font-bold text-cyan-400">{player.score}ms</div>
                    <div className="text-xs text-slate-400">Avg Time</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{player.rewards}</div>
                    <div className="text-xs text-slate-400">GORB</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Reward Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-400 font-bold">Sub 200ms</div>
              <div className="text-slate-300">100 GORB per game</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">200-300ms</div>
              <div className="text-slate-300">50 GORB per game</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-bold">300ms+</div>
              <div className="text-slate-300">10 GORB per game</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
