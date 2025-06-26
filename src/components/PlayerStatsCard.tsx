
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, User } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';

interface PlayerStatsCardProps {
  walletAddress: string;
}

const PlayerStatsCard = ({ walletAddress }: PlayerStatsCardProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getPlayerStats } = useMatches();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const playerStats = await getPlayerStats(walletAddress);
      setStats(playerStats);
      setLoading(false);
    };

    if (walletAddress) {
      loadStats();
    }
  }, [walletAddress, getPlayerStats]);

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-slate-400 text-center">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  const winRate = stats?.total_battles > 0 ? Math.round((stats.total_victories / stats.total_battles) * 100) : 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-400" />
          Player Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats?.total_battles || 0}</div>
            <div className="text-sm text-slate-400">Total Battles</div>
          </div>
          
          <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats?.total_victories || 0}</div>
            <div className="text-sm text-slate-400">Victories</div>
          </div>
          
          <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{winRate}%</div>
            <div className="text-sm text-slate-400">Win Rate</div>
          </div>
          
          <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="flex items-center justify-center mb-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600">
                BEST
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{stats?.best_tap_count || 0}</div>
            <div className="text-sm text-slate-400">Best Taps</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;
