
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Coins, ArrowLeft, Play, Copy, Check, Clock } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import { supabase } from '@/integrations/supabase/client';
import RealTimeGame from '@/components/RealTimeGame';

const MatchPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { getMatch, joinMatch } = useMatches();
  const { toast } = useToast();
  const { walletAddress, isConnected } = useWalletAddress();

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
      toast({
        title: "⚠️ Wallet Required",
        description: "Please connect your wallet to join matches",
        variant: "destructive"
      });
    }
  }, [isConnected, navigate, toast]);

  useEffect(() => {
    const loadMatch = async () => {
      if (!matchId) return;
      
      try {
        const matchData = await getMatch(matchId);
        setMatch(matchData);
        
        if (matchData) {
          const isPlayerInMatch = 
            matchData.creator_wallet === walletAddress || 
            matchData.opponent_wallet === walletAddress;
          
          if (isPlayerInMatch) {
            setHasJoined(true);
          }

          // Start game if match is in progress with both players
          if (matchData.status === 'in_progress' && matchData.opponent_wallet && matchData.creator_wallet) {
            setGameStarted(true);
            console.log('Game auto-started for both players');
          }
        }
      } catch (error) {
        console.error('Failed to load match:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId, getMatch, walletAddress]);

  // Real-time subscription for match updates
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          const updatedMatch = payload.new;
          setMatch(updatedMatch);
          
          console.log('Match updated:', updatedMatch);
          
          // Auto-start game when status becomes 'in_progress' and both players are present
          if (updatedMatch.status === 'in_progress' && 
              updatedMatch.opponent_wallet && 
              updatedMatch.creator_wallet && 
              !gameStarted) {
            console.log('Starting game for both players!');
            setGameStarted(true);
            toast({
              title: "⚡ Game Starting!",
              description: "Both players ready - let's go!",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, gameStarted, toast]);

  const handleJoinMatch = async () => {
    if (!matchId || !match || !walletAddress) return;

    try {
      console.log('Player joining match:', matchId);
      await joinMatch(matchId, walletAddress);
      setHasJoined(true);
      toast({
        title: "✅ Joined Battle!",
        description: "Game starting now...",
      });
    } catch (error) {
      console.error('Failed to join match:', error);
      toast({
        title: "❌ Failed to Join",
        description: "Could not join the battle",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      toast({
        title: "✅ Link Copied!",
        description: "Share this link with others",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleGameComplete = () => {
    console.log('Game completed!');
    setGameStarted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-xl mb-4">Match Not Found</div>
            <div className="text-slate-400 mb-6">This match doesn't exist or has been removed.</div>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the game interface when game has started
  if (gameStarted && match.status === 'in_progress' && match.opponent_wallet && match.creator_wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </div>
          
          <RealTimeGame 
            matchId={matchId!}
            walletAddress={walletAddress!}
            onGameComplete={handleGameComplete}
          />
        </div>
      </div>
    );
  }

  // Show lobby/waiting room
  const isCreator = match?.creator_wallet === walletAddress;
  const canJoin = !hasJoined && !isCreator && match?.status === 'waiting' && !match?.opponent_wallet && walletAddress;
  const isWaitingForOpponent = match?.status === 'waiting' && !match?.opponent_wallet;
  const bothPlayersReady = match?.opponent_wallet && match?.creator_wallet && match?.status === 'in_progress';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleCopyLink}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm"
          >
            {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {linkCopied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Battle Lobby Header */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-slate-100 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 mr-3 text-purple-400" />
                Battle Lobby
                {match.is_quick_game && <Badge className="ml-3 bg-amber-600">Quick Game</Badge>}
              </CardTitle>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">
                  {isWaitingForOpponent ? 'Waiting for opponent...' : 
                   bothPlayersReady ? 'Game starting!' : 'Ready to battle!'}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Match Details */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100 flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-7 h-7 mr-3 text-purple-400" />
                  Tap Race Battle
                </div>
                <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg px-4 py-2">
                  {match.wager * 2} GORB Prize
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Creator</div>
                  <div className="text-slate-200 font-mono text-sm">
                    {match.creator_wallet.slice(0, 8)}...{match.creator_wallet.slice(-6)}
                  </div>
                  {isCreator && <Badge className="mt-2 bg-purple-600">You</Badge>}
                </div>
                
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Opponent</div>
                  <div className="text-slate-200 font-mono text-sm">
                    {match.opponent_wallet 
                      ? `${match.opponent_wallet.slice(0, 8)}...${match.opponent_wallet.slice(-6)}`
                      : 'Waiting for opponent...'
                    }
                  </div>
                  {match.opponent_wallet === walletAddress && <Badge className="mt-2 bg-purple-600">You</Badge>}
                </div>
              </div>

              {/* Match Info */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold text-white">{match.wager}</div>
                  <div className="text-xs text-slate-400">GORB Each</div>
                </div>
                
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-white">1v1</div>
                  <div className="text-xs text-slate-400">Players</div>
                </div>
                
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-lg font-bold text-white">10s</div>
                  <div className="text-xs text-slate-400">Duration</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                {canJoin && (
                  <>
                    <div className="text-lg text-slate-200 mb-4">
                      Ready to join this battle?
                    </div>
                    <Button 
                      onClick={handleJoinMatch}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg font-bold py-4"
                    >
                      <Play className="w-5 h-5 mr-3" />
                      ⚡ JOIN BATTLE ({match.wager} GORB)
                    </Button>
                  </>
                )}

                {isCreator && isWaitingForOpponent && (
                  <div className="text-center space-y-4">
                    <div className="text-lg text-slate-200 mb-2">
                      🔗 Share this link with your opponent:
                    </div>
                    <div className="bg-slate-700/60 border border-slate-600/40 rounded-lg p-3 text-sm text-slate-300 font-mono break-all">
                      {window.location.href}
                    </div>
                    <div className="text-amber-400 text-sm flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      ⏳ Waiting for opponent to join...
                    </div>
                  </div>
                )}

                {hasJoined && isWaitingForOpponent && !isCreator && (
                  <div className="text-center">
                    <div className="text-lg text-emerald-400 mb-2">✅ You've joined this battle!</div>
                    <div className="text-slate-400 flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Waiting for the game to start...
                    </div>
                  </div>
                )}

                {bothPlayersReady && (
                  <div className="text-center">
                    <div className="text-lg text-emerald-400 mb-2">🎮 Both players ready!</div>
                    <div className="text-slate-400 flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Starting battle...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
