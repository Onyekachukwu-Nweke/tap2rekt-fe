
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, Eye } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';

interface MatchHistoryProps {
  walletAddress: string;
  onViewMatch?: (matchId: string) => void;
}

const MatchHistory = ({ walletAddress, onViewMatch }: MatchHistoryProps) => {
  const [completedMatches, setCompletedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCompletedMatches } = useMatches();

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const matches = await getCompletedMatches(walletAddress);
      setCompletedMatches(matches);
      setLoading(false);
    };

    if (walletAddress) {
      loadHistory();
    }
  }, [walletAddress, getCompletedMatches]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const completed = new Date(timestamp);
    const diffMs = now.getTime() - completed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-slate-400 text-center">Loading match history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-400" />
          Match History
          <Badge className="ml-3 bg-slate-600">
            {completedMatches.length} Games
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedMatches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 text-lg mb-2">No completed battles yet</div>
            <div className="text-slate-500 text-sm">Start playing to build your history!</div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {completedMatches.map((match) => {
              const isWinner = match.winner_wallet === walletAddress;
              const isCreator = match.creator_wallet === walletAddress;
              const opponentWallet = isCreator ? match.opponent_wallet : match.creator_wallet;
              
              return (
                <div 
                  key={match.id}
                  className="flex items-center justify-between bg-slate-700/40 border border-slate-600/30 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isWinner 
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                        : 'bg-gradient-to-r from-red-600 to-pink-600'
                    }`}>
                      {isWinner ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <Target className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-slate-200 font-semibold flex items-center">
                        vs {opponentWallet?.slice(0, 8)}...{opponentWallet?.slice(-4)}
                        <Badge className={`ml-2 ${
                          isWinner ? 'bg-emerald-600' : 'bg-red-600'
                        }`}>
                          {isWinner ? 'Victory' : 'Defeat'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-400">
                        <div>{formatTimeAgo(match.completed_at)}</div>
                        <div>{match.wager} GORB</div>
                        {match.is_private && (
                          <Badge variant="outline" className="text-xs">Private</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-gradient-to-r from-amber-600 to-orange-600">
                      {match.wager * 2} GORB
                    </Badge>
                    {onViewMatch && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewMatch(match.id)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchHistory;
