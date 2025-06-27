
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Zap, Crown } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

const Leaderboard = () => {
  const { leaderboard, loading, refetch } = useLeaderboard();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <div className="text-white">Loading leaderboard...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                Lightning Reflexes Leaderboard
              </CardTitle>
              <p className="text-purple-200">
                Top players competing on the Gorbagana testnet. Rankings update in real-time!
              </p>
            </div>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-200 hover:bg-purple-800/30"
            >
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Top 3 Podium */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((player, index) => (
            <Card 
              key={player.wallet_address} 
              className={`${getRankStyle(index + 1)} relative overflow-hidden`}
            >
              <CardContent className="p-6 text-center">
                <div className="absolute top-2 right-2">
                  {getRankIcon(index + 1)}
                </div>
                <div className="text-3xl font-bold mb-2">#{index + 1}</div>
                <div className="text-lg font-semibold text-white mb-2">{player.display_name}</div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">{player.best_tap_count}</div>
                <div className="text-sm text-slate-300">Best Taps</div>
                <div className="mt-3 space-y-1">
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {player.total_victories} Wins
                  </Badge>
                  <div className="text-xs text-slate-400">
                    {player.win_rate}% Win Rate
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            {leaderboard.length > 0 ? (
              leaderboard.map((player, index) => (
                <div 
                  key={player.wallet_address}
                  className={`${getRankStyle(index + 1)} p-4 rounded-lg flex items-center justify-between`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(index + 1)}
                      <span className="text-xl font-bold text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{player.display_name}</div>
                      <div className="text-sm text-slate-400">
                        {player.total_battles} games • {player.win_rate}% win rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <div className="text-lg font-bold text-cyan-400">{player.best_tap_count}</div>
                      <div className="text-xs text-slate-400">Best Taps</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">{player.total_victories}</div>
                      <div className="text-xs text-slate-400">Victories</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <div className="text-xl text-slate-300 mb-2">No Players Yet</div>
                <div className="text-slate-400">Be the first to compete and claim the top spot!</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Competition Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-400 font-bold">High Taps</div>
              <div className="text-slate-300">200+ taps per game</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">Consistent Wins</div>
              <div className="text-slate-300">80%+ win rate</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-bold">Battle Veteran</div>
              <div className="text-slate-300">50+ battles fought</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
