
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Coins, Play, Zap } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useNavigate } from 'react-router-dom';

interface ActiveMatchesProps {
  walletAddress: string;
  onJoinMatch?: (matchId: string) => void;
}

const ActiveMatches = ({ walletAddress, onJoinMatch }: ActiveMatchesProps) => {
  const { matches, loading } = useMatches();
  const navigate = useNavigate();

  const handleJoinMatch = (matchId: string) => {
    navigate(`/match/${matchId}`);
    if (onJoinMatch) {
      onJoinMatch(matchId);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  // Filter out private matches completely
  const publicMatches = matches.filter(match => !match.is_private);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-600/30 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="text-slate-400">Loading active battles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-600/30 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-slate-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span>Active Battles</span>
          </div>
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-3 py-1 text-sm">
            <Zap className="w-3 h-3 mr-1" />
            {publicMatches.length} Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {publicMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-slate-300 text-lg font-medium mb-2">No active battles</div>
            <div className="text-slate-500 text-sm">Create the first battle and start the action!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {publicMatches.map((match) => (
              <div 
                key={match.id}
                className="group relative bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/30 rounded-xl p-4 hover:from-slate-700/60 hover:to-slate-800/60 transition-all duration-300 hover:border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold text-sm">
                        {match.creator_wallet.slice(0, 6)}...{match.creator_wallet.slice(-4)}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(match.created_at)}
                        </div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="flex items-center">
                          <Coins className="w-3 h-3 mr-1 text-amber-400" />
                          {match.wager} GORB
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-2 py-1">
                      Win {match.wager * 2} GORB
                    </Badge>
                    <Button 
                      size="sm"
                      className={`${
                        match.creator_wallet === walletAddress 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 cursor-default' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                      } font-medium px-4 py-2 text-xs transition-all duration-200`}
                      onClick={() => handleJoinMatch(match.id)}
                      disabled={match.creator_wallet === walletAddress}
                    >
                      {match.creator_wallet === walletAddress ? (
                        'Your Battle'
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Join Battle
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveMatches;
