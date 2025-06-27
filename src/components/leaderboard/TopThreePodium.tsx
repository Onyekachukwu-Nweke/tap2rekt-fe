
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Medal, Award, Trophy } from 'lucide-react';

interface LeaderboardEntry {
  wallet_address: string;
  total_battles: number;
  total_victories: number;
  best_tap_count: number;
  win_rate: number;
  display_name: string;
}

interface TopThreePodiumProps {
  topThree: LeaderboardEntry[];
  currentSort: 'victories' | 'taps' | 'winRate';
  walletAddress?: string;
}

const TopThreePodium = ({ topThree, currentSort, walletAddress }: TopThreePodiumProps) => {
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

  const getValue = (player: LeaderboardEntry) => {
    switch (currentSort) {
      case 'victories':
        return player.total_victories;
      case 'taps':
        return player.best_tap_count;
      case 'winRate':
        return `${player.win_rate}%`;
      default:
        return player.total_victories;
    }
  };

  const getLabel = () => {
    switch (currentSort) {
      case 'victories':
        return 'Victories';
      case 'taps':
        return 'Best Taps';
      case 'winRate':
        return 'Win Rate';
      default:
        return 'Victories';
    }
  };

  const isUserRow = (player: LeaderboardEntry) => 
    walletAddress && player.wallet_address === walletAddress;

  if (topThree.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 rounded-3xl blur-3xl"></div>
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {topThree.map((player, index) => (
          <Card 
            key={player.wallet_address}
            className={`relative overflow-hidden transition-all duration-500 hover:scale-110 ${getPodiumStyle(index + 1)} ${
              isUserRow(player) ? 'ring-4 ring-emerald-400 ring-opacity-60' : ''
            }`}
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
                {getValue(player)}
              </div>
              <div className="text-sm text-slate-400 mb-4">
                {getLabel()}
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
  );
};

export default TopThreePodium;
