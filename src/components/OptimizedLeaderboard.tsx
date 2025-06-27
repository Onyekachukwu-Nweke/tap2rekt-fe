
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, User } from 'lucide-react';
import { useOptimizedLeaderboard } from '@/hooks/useOptimizedLeaderboard';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import LeaderboardSkeleton from './leaderboard/LeaderboardSkeleton';
import TopThreePodium from './leaderboard/TopThreePodium';
import LeaderboardList from './leaderboard/LeaderboardList';

type SortType = 'victories' | 'taps' | 'winRate';

const OptimizedLeaderboard = () => {
  const { leaderboard, loading, currentSort, refetch, changeSort } = useOptimizedLeaderboard();
  const { walletAddress } = useWalletAddress();
  const [currentPage, setCurrentPage] = useState(1);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
  
  // Find user position when leaderboard updates
  useEffect(() => {
    if (walletAddress && leaderboard.length > 0) {
      const position = leaderboard.findIndex(player => player.wallet_address === walletAddress);
      setUserPosition(position >= 0 ? position + 1 : null);
    }
  }, [leaderboard, walletAddress]);

  const handleSort = (sortType: SortType) => {
    changeSort(sortType);
    setCurrentPage(1); // Reset to first page when sorting
  };

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-100 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
          🏆 Champions Leaderboard 🏆
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          The elite tappers dominating the Gorbagana testnet battlegrounds
        </p>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant={currentSort === 'victories' ? 'default' : 'outline'}
          onClick={() => handleSort('victories')}
          className={`${currentSort === 'victories' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'} transition-all duration-300`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Most Victories
        </Button>
        <Button
          variant={currentSort === 'taps' ? 'default' : 'outline'}
          onClick={() => handleSort('taps')}
          className={`${currentSort === 'taps' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'} transition-all duration-300`}
        >
          <Target className="w-4 h-4 mr-2" />
          Best Taps
        </Button>
        <Button
          variant={currentSort === 'winRate' ? 'default' : 'outline'}
          onClick={() => handleSort('winRate')}
          className={`${currentSort === 'winRate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'} transition-all duration-300`}
        >
          <Zap className="w-4 h-4 mr-2" />
          Win Rate
        </Button>
        <Button
          variant="outline"
          onClick={refetch}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-300"
        >
          🔄 Refresh
        </Button>
      </div>

      {/* User Position Indicator */}
      {userPosition && (
        <Card className="bg-gradient-to-r from-emerald-800/40 to-teal-800/40 border-emerald-500/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-3">
              <User className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">
                Your current position: #{userPosition}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      <TopThreePodium 
        topThree={topThree}
        currentSort={currentSort}
        walletAddress={walletAddress}
      />

      {/* Leaderboard List */}
      <LeaderboardList
        leaderboard={leaderboard}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        walletAddress={walletAddress}
      />

      {/* Stats Summary */}
      <Card className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-slate-600/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-400" />
            Competition Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-purple-300">
                {leaderboard.reduce((sum, player) => sum + player.total_battles, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Battles</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-emerald-300">
                {leaderboard.reduce((sum, player) => sum + player.total_victories, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Victories</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-amber-300">
                {Math.max(...leaderboard.map(p => p.best_tap_count), 0)}
              </div>
              <div className="text-sm text-slate-400">Record Taps</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-indigo-300">{leaderboard.length}</div>
              <div className="text-sm text-slate-400">Active Players</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {leaderboard.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <Trophy className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            <div className="text-2xl text-slate-300 mb-4">No Champions Yet</div>
            <div className="text-slate-400 text-lg">Be the first to battle and claim the throne!</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedLeaderboard;
