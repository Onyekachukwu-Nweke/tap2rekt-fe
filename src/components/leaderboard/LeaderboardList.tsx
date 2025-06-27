
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Crown, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeaderboardEntry {
  wallet_address: string;
  total_battles: number;
  total_victories: number;
  best_tap_count: number;
  win_rate: number;
  display_name: string;
}

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  walletAddress?: string;
}

const ITEMS_PER_PAGE = 10;

const LeaderboardList = ({ 
  leaderboard, 
  currentPage, 
  totalPages, 
  onPageChange, 
  walletAddress 
}: LeaderboardListProps) => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlayers = leaderboard.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const isUserRow = (player: LeaderboardEntry) => 
    walletAddress && player.wallet_address === walletAddress;

  return (
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
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => onPageChange(pageNum)}
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
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
  );
};

export default LeaderboardList;
