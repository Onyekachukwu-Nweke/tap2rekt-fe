
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Coins } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';

interface ActiveMatchesProps {
  walletAddress: string;
  onJoinMatch?: (matchId: string) => void;
}

const ActiveMatches = ({ walletAddress, onJoinMatch }: ActiveMatchesProps) => {
  const { matches, loading, joinMatch } = useMatches();

  const handleJoinMatch = async (matchId: string) => {
    try {
      await joinMatch(matchId, walletAddress);
      if (onJoinMatch) {
        onJoinMatch(matchId);
      }
    } catch (error) {
      console.error('Failed to join match:', error);
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
      <Card className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-slate-600/30 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="text-slate-400">Loading active battles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-slate-600/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-200 flex items-center">
          <Target className="w-6 h-6 mr-3 text-purple-400" />
          Public Battles
          <Badge className="ml-3 bg-gradient-to-r from-emerald-600 to-teal-600">
            {publicMatches.length} Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {publicMatches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 text-lg mb-2">No public battles available</div>
            <div className="text-slate-500 text-sm">Create one or check back later!</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {publicMatches.map((match) => (
              <div 
                key={match.id}
                className="flex items-center justify-between bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/60 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">
                      {match.creator_wallet.slice(0, 8)}...{match.creator_wallet.slice(-6)}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(match.created_at)}
                      </div>
                      <div className="flex items-center">
                        <Coins className="w-3 h-3 mr-1" />
                        {match.wager} GOR
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold">
                    {match.wager} GORB
                  </Badge>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    onClick={() => handleJoinMatch(match.id)}
                    disabled={match.creator_wallet === walletAddress}
                  >
                    {match.creator_wallet === walletAddress ? 'Your Battle' : 'Join Battle'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-slate-700/20 border border-slate-600/20 rounded-lg text-center">
          <p className="text-slate-400 text-sm">
            🔒 <strong>Private battles</strong> are completely hidden and only accessible via direct link
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveMatches;
