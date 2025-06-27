
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, Crown, Medal, Award, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useWalletAddress } from '@/hooks/useWalletAddress';

type SortType = 'victories' | 'taps' | 'winRate';

const OptimizedLeaderboard = () => {
  const { leaderboard, loading, refetch, getTopPlayersByTaps, getTopPlayersByWinRate } = useLeaderboard();
  const { walletAddress } = useWalletAddress();
  const [sortedLeaderboard, setSortedLeaderboard] = useState(leaderboard);
  const [currentSort, setCurrentSort] = useState<SortType>('victories');
  const [currentPage, setCurrentPage] = useState(1);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedLeaderboard.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
    setSortedLeaderboard(leaderboard);
    if (walletAddress) {
      const position = leaderboard.findIndex(player => player.wallet_address === walletAddress);
      setUserPosition(position >= 0 ? position + 1 : null);
    }
  }, [leaderboard, walletAddress]);

  const handleSort = async (sortType: SortType) => {
    setCurrentSort(sortType);
    setCurrentPage(1);
    
    if (sortType === 'taps') {
      const topByTaps = await getTopPlayersByTaps(50);
      setSortedLeaderboard(topByTaps);
    } else if (sortType === 'winRate') {
      const topByWinRate = await getTopPlayersByWinRate(50);
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
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border-yellow-500/60 shadow-2xl shadow-yellow-500/40 scale-105';
      case 2:
        return 'bg-gradient-to-br from-gray-400/30 to-gray-500/30 border-gray-400/60 shadow-xl shadow-gray-400/30';
      case 3:
        return 'bg-gradient-to-br from-amber-600/30 to-orange-600/30 border-amber-600/60 shadow-xl shadow-amber-600/30';
      default:
        return '';
    }
  };

  const isUserRow = (player: any) => walletAddress && player.wallet_address === walletAddress;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="text-center">
          <div className="h-12 bg-slate-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-slate-800 rounded w-96 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const topThree = sortedLeaderboard.slice(0, 3);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPlayers = sortedLeaderboard.slice(startIndex, endIndex);

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
      {topThree.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 rounded-3xl blur-3xl"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {topThree.map((player, index) => (
              <Card 
                key={player.wallet_address}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-110 ${getPodiumStyle(index + 1)} ${isUserRow(player) ? 'ring-4 ring-emerald-400 ring-opacity-60' : ''}`}
              >
                <div className="absolute top-4 right-4 z-10">
                  {getRankIcon(index + 1)}
                </div>
                
                {/* Crown for #1 */}
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-3 pt-8">
                  <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-amber-600 to-orange-600'
                  } shadow-2xl`}>
                    <span className="text-2xl font-bold text-white">#{index + 1}</span>
                  </div>
                  <CardTitle className="text-xl text-white font-bold">
                    {isUserRow(player) ? '👑 YOU 👑' : player.display_name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4 pb-6">
                  <div className="text-4xl font-bold text-purple-300 mb-2">
                    {currentSort === 'victories' ? player.total_victories : 
                     currentSort === 'taps' ? player.best_tap_count :
                     `${player.win_rate}%`}
                  </div>
                  <div className="text-sm text-slate-400 mb-4">
                    {currentSort === 'victories' ? 'Victories' : 
                     currentSort === 'taps' ? 'Best Taps' :
                     'Win Rate'}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/30">
                      <div className="text-emerald-400 font-bold text-lg">{player.total_battles}</div>
                      <div className="text-slate-400">Battles</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/30">
                      <div className="text-amber-400 font-bold text-lg">{player.win_rate}%</div>
                      <div className="text-slate-400">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Top 20 List with Pagination */}
      <Card className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-6 h-6 mr-3 text-purple-400" />
              Top Players
            </div>
            <Badge className="bg-purple-600 text-white">
              Page {currentPage} of {totalPages}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedPlayers.map((player, index) => {
              const actualRank = startIndex + index + 1;
              const isCurrentUser = isUserRow(player);
              
              return (
                <div 
                  key={player.wallet_address}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-2 border-emerald-400/50 shadow-lg shadow-emerald-400/20 animate-pulse' 
                      : 'bg-slate-700/40 border border-slate-600/30 hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={`font-bold min-w-[3rem] justify-center ${
                      actualRank <= 3 ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-700'
                    }`}>
                      #{actualRank}
                    </Badge>
                    
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      {isCurrentUser ? <Crown className="w-6 h-6 text-yellow-400" /> : <Target className="w-6 h-6 text-white" />}
                    </div>
                    
                    <div>
                      <div className={`font-semibold text-lg ${isCurrentUser ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {isCurrentUser ? '👑 YOU 👑' : player.display_name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {player.total_battles} battles • {player.win_rate}% win rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
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
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-slate-600/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={pageNum === currentPage ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                {sortedLeaderboard.reduce((sum, player) => sum + player.total_battles, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Battles</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-emerald-300">
                {sortedLeaderboard.reduce((sum, player) => sum + player.total_victories, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Victories</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-amber-300">
                {Math.max(...sortedLeaderboard.map(p => p.best_tap_count), 0)}
              </div>
              <div className="text-sm text-slate-400">Record Taps</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300">
              <div className="text-2xl font-bold text-indigo-300">{sortedLeaderboard.length}</div>
              <div className="text-sm text-slate-400">Active Players</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedLeaderboard.length === 0 && (
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
