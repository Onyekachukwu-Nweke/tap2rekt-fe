
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, Crown, Medal, Award } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

type SortType = 'victories' | 'taps' | 'winRate';

const TapRaceLeaderboard = () => {
  const { leaderboard, loading, refetch, getTopPlayersByTaps, getTopPlayersByWinRate } = useLeaderboard();
  const [sortedLeaderboard, setSortedLeaderboard] = useState(leaderboard);
  const [currentSort, setCurrentSort] = useState<SortType>('victories');

  useEffect(() => {
    setSortedLeaderboard(leaderboard);
  }, [leaderboard]);

  const handleSort = async (sortType: SortType) => {
    setCurrentSort(sortType);
    
    if (sortType === 'taps') {
      const topByTaps = await getTopPlayersByTaps(10);
      setSortedLeaderboard(topByTaps);
    } else if (sortType === 'winRate') {
      const topByWinRate = await getTopPlayersByWinRate(10);
      setSortedLeaderboard(topByWinRate);
    } else {
      setSortedLeaderboard(leaderboard);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-2xl text-slate-300">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  const topThree = sortedLeaderboard.slice(0, 3);
  const remainingPlayers = sortedLeaderboard.slice(3, 10);

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

      {/* Sort Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          variant={currentSort === 'victories' ? 'default' : 'outline'}
          onClick={() => handleSort('victories')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Most Victories
        </Button>
        <Button
          variant={currentSort === 'taps' ? 'default' : 'outline'}
          onClick={() => handleSort('taps')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Target className="w-4 h-4 mr-2" />
          Best Taps
        </Button>
        <Button
          variant={currentSort === 'winRate' ? 'default' : 'outline'}
          onClick={() => handleSort('winRate')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Win Rate
        </Button>
        <Button
          variant="outline"
          onClick={refetch}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          🔄 Refresh
        </Button>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topThree.map((player, index) => (
            <Card 
              key={player.wallet_address}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-500/50 shadow-lg shadow-yellow-500/25' 
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-gray-400/50 shadow-lg shadow-gray-400/25'
                  : 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-600/50 shadow-lg shadow-amber-600/25'
              }`}
            >
              <div className="absolute top-4 right-4">
                {getRankIcon(index + 1)}
              </div>
              <CardHeader className="text-center pb-2">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-amber-600 to-orange-600'
                }`}>
                  <span className="text-2xl font-bold text-white">#{index + 1}</span>
                </div>
                <CardTitle className="text-xl text-white">{player.display_name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="text-3xl font-bold text-purple-300">
                  {currentSort === 'victories' ? player.total_victories : 
                   currentSort === 'taps' ? player.best_tap_count :
                   `${player.win_rate}%`}
                </div>
                <div className="text-sm text-slate-400">
                  {currentSort === 'victories' ? 'Victories' : 
                   currentSort === 'taps' ? 'Best Taps' :
                   'Win Rate'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-700/40 rounded p-2">
                    <div className="text-emerald-400 font-bold">{player.total_battles}</div>
                    <div className="text-slate-400">Battles</div>
                  </div>
                  <div className="bg-slate-700/40 rounded p-2">
                    <div className="text-amber-400 font-bold">{player.win_rate}%</div>
                    <div className="text-slate-400">Win Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Leaderboard */}
      {remainingPlayers.length > 0 && (
        <Card className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-200 flex items-center">
              <Target className="w-6 h-6 mr-3 text-purple-400" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {remainingPlayers.map((player, index) => (
                <div 
                  key={player.wallet_address}
                  className="flex items-center justify-between bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getRankBadge(index + 4)} font-bold min-w-[3rem] justify-center`}>
                      #{index + 4}
                    </Badge>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-slate-200 font-semibold text-lg">{player.display_name}</div>
                      <div className="text-sm text-slate-400">{player.total_battles} battles fought</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-300">{player.best_tap_count}</div>
                      <div className="text-xs text-slate-400">Best Taps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-emerald-300">{player.total_victories}</div>
                      <div className="text-xs text-slate-400">Victories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-amber-300">{player.win_rate}%</div>
                      <div className="text-xs text-slate-400">Win Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="text-2xl font-bold text-purple-300">
                {leaderboard.reduce((sum, player) => sum + player.total_battles, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Battles</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-300">
                {leaderboard.reduce((sum, player) => sum + player.total_victories, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Victories</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-300">
                {Math.max(...leaderboard.map(p => p.best_tap_count), 0)}
              </div>
              <div className="text-sm text-slate-400">Record Taps</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-300">{leaderboard.length}</div>
              <div className="text-sm text-slate-400">Active Players</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedLeaderboard.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <div className="text-xl text-slate-300 mb-2">No Players Yet</div>
            <div className="text-slate-400">Be the first to compete and claim the top spot!</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TapRaceLeaderboard;
