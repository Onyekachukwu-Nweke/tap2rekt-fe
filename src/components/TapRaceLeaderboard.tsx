
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, Crown, Medal, Award } from 'lucide-react';

const TapRaceLeaderboard = () => {
  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, player: "SpeedDemon", taps: 287, battles: 45, winRate: 89, earnings: 2340 },
    { rank: 2, player: "TapMaster99", taps: 276, battles: 38, winRate: 84, earnings: 1890 },
    { rank: 3, player: "LightningFast", taps: 271, battles: 52, winRate: 77, earnings: 2100 },
    { rank: 4, player: "ClickKing", taps: 268, battles: 29, winRate: 86, earnings: 1560 },
    { rank: 5, player: "RapidFire", taps: 265, battles: 41, winRate: 73, earnings: 1820 },
    { rank: 6, player: "ThunderTaps", taps: 261, battles: 33, winRate: 79, earnings: 1680 },
    { rank: 7, player: "VelocityX", taps: 258, battles: 47, winRate: 72, earnings: 1940 },
    { rank: 8, player: "QuickStrike", taps: 255, battles: 26, winRate: 88, earnings: 1450 },
    { rank: 9, player: "BlazeFinger", taps: 252, battles: 39, winRate: 74, earnings: 1720 },
    { rank: 10, player: "SwiftTapper", taps: 249, battles: 35, winRate: 77, earnings: 1590 }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-600 text-white";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-100 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
          🏆 Tap Race Champions 🏆
        </h2>
        <p className="text-xl text-slate-300">
          The fastest tappers on Gorbagana testnet
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboardData.slice(0, 3).map((player, index) => (
          <Card 
            key={player.rank}
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              player.rank === 1 
                ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-500/50 shadow-lg shadow-yellow-500/25' 
                : player.rank === 2
                ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-gray-400/50 shadow-lg shadow-gray-400/25'
                : 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-600/50 shadow-lg shadow-amber-600/25'
            }`}
          >
            <div className="absolute top-4 right-4">
              {getRankIcon(player.rank)}
            </div>
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                player.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                player.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                'bg-gradient-to-r from-amber-600 to-orange-600'
              }`}>
                <span className="text-2xl font-bold text-white">#{player.rank}</span>
              </div>
              <CardTitle className="text-xl text-white">{player.player}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="text-3xl font-bold text-purple-300">{player.taps}</div>
              <div className="text-sm text-slate-400">Best Taps</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/40 rounded p-2">
                  <div className="text-emerald-400 font-bold">{player.winRate}%</div>
                  <div className="text-slate-400">Win Rate</div>
                </div>
                <div className="bg-slate-700/40 rounded p-2">
                  <div className="text-amber-400 font-bold">{player.earnings}</div>
                  <div className="text-slate-400">GORB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-200 flex items-center">
            <Target className="w-6 h-6 mr-3 text-purple-400" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((player) => (
              <div 
                key={player.rank}
                className="flex items-center justify-between bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <Badge className={`${getRankBadge(player.rank)} font-bold min-w-[3rem] justify-center`}>
                    #{player.rank}
                  </Badge>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold text-lg">{player.player}</div>
                    <div className="text-sm text-slate-400">{player.battles} battles fought</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300">{player.taps}</div>
                    <div className="text-xs text-slate-400">Best Taps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-300">{player.winRate}%</div>
                    <div className="text-xs text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-300">{player.earnings}</div>
                    <div className="text-xs text-slate-400">GORB Earned</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-slate-600/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-400" />
            Competition Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-300">1,247</div>
              <div className="text-sm text-slate-400">Total Battles</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-300">23,490</div>
              <div className="text-sm text-slate-400">GORB Wagered</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-300">287</div>
              <div className="text-sm text-slate-400">Record Taps</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-300">156</div>
              <div className="text-sm text-slate-400">Active Players</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TapRaceLeaderboard;
