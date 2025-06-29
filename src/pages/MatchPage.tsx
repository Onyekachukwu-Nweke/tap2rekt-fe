
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Coins, ArrowLeft, Copy, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import { useMatchLobby } from '@/hooks/useMatchLobby';
import { useMatchLobbyWebSocket } from '@/hooks/useMatchLobbyWebSocket';
import RealTimeGame from '@/components/RealTimeGame';
import WagerActions from '@/components/WagerActions';

const MatchPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  const { walletAddress, isConnected } = useWalletAddress();

  // Use optimized match lobby hook
  const { match, loading, error, refetch } = useMatchLobby(matchId || '', walletAddress || '');
  
  // Use WebSocket for real-time lobby updates
  const { isConnected: wsConnected, lobbyState } = useMatchLobbyWebSocket(
    matchId || '', 
    walletAddress || '', 
    match?.creator_wallet === walletAddress ? 'creator' : 'opponent'
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading match...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-red-400 text-xl mb-4">
              {error || 'Match Not Found'}
            </div>
            <div className="text-slate-400 mb-6">
              {error || "This match doesn't exist or has been removed."}
            </div>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-600 to-indigo-600 w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = match?.creator_wallet === walletAddress;
  const isOpponent = match?.opponent_wallet === walletAddress;
  const isPlayerInMatch = isCreator || isOpponent;
  
  // Fixed deposit status logic - use OR instead of AND to show as confirmed if either source confirms it
  const creatorDeposited = match?.creator_deposit_confirmed || lobbyState.deposits.creator;
  const opponentDeposited = match?.opponent_deposit_confirmed || lobbyState.deposits.opponent;
  const bothPlayersReady = match?.opponent_wallet && match?.creator_wallet;
  const bothDepositsConfirmed = creatorDeposited && opponentDeposited;

  console.log('Deposit Status Debug:', {
    'DB Creator Deposited': match?.creator_deposit_confirmed,
    'WS Creator Deposited': lobbyState.deposits.creator,
    'Final Creator Deposited': creatorDeposited,
    'DB Opponent Deposited': match?.opponent_deposit_confirmed,
    'WS Opponent Deposited': lobbyState.deposits.opponent,
    'Final Opponent Deposited': opponentDeposited,
    'Both Deposits Confirmed': bothDepositsConfirmed
  });

  // Show WebSocket multiplayer game ONLY when both deposits are confirmed and match status allows it
  if (bothPlayersReady && isPlayerInMatch && bothDepositsConfirmed && 
      (match?.status === 'in_progress' || lobbyState.matchStatus === 'in_progress')) {
    console.log('Both players ready with deposits confirmed - showing WebSocket multiplayer game');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <RealTimeGame 
            matchId={matchId!}
            walletAddress={walletAddress!}
          />
        </div>
      </div>
    );
  }

  // Show completed match results
  if (match?.status === 'completed' && isPlayerInMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl">
              <CardHeader className="text-center p-6">
                <CardTitle className="text-3xl text-slate-100 mb-4">
                  {match.winner_wallet === walletAddress ? '🏆 Victory!' : 
                   match.winner_wallet ? '💀 Defeat' : '🤝 Draw'}
                </CardTitle>
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg px-4 py-2">
                  Match Completed
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <WagerActions 
                  matchId={matchId!} 
                  match={match} 
                  walletAddress={walletAddress!} 
                />
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Hub
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Lobby UI, match details, etc.
  const canJoin = !isPlayerInMatch && match?.status === 'waiting' && !match?.opponent_wallet && walletAddress;
  const isWaitingForOpponent = match?.status === 'waiting' && !match?.opponent_wallet;
  const isWaitingForDeposits = match?.opponent_wallet && match?.status === 'waiting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleCopyLink}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-800/50 backdrop-blur-sm w-full sm:w-auto"
          >
            {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {linkCopied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Battle Lobby Header */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl mb-4 md:mb-6">
            <CardHeader className="text-center p-4 md:p-6">
              <CardTitle className="text-2xl md:text-3xl text-slate-100 flex flex-col md:flex-row items-center justify-center mb-4 gap-3">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                <span>Battle Lobby</span>
                <Badge className="bg-emerald-600">30s Battle</Badge>
              </CardTitle>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                <span className="text-sm md:text-base text-slate-300">
                  {isWaitingForOpponent ? 'Waiting for opponent...' : 
                   isWaitingForDeposits ? 'Waiting for deposits...' : 
                   bothDepositsConfirmed ? 'Ready for battle!' : 'Confirming deposits...'}
                </span>
              </div>
              
              {/* WebSocket Connection Status */}
              {isPlayerInMatch && (
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-slate-400">
                    {wsConnected ? 'Live updates active' : 'Connecting...'}
                  </span>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Match Details */}
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl mb-6">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <Target className="w-5 h-5 md:w-7 md:h-7 mr-3 text-purple-400" />
                  <span className="text-base md:text-xl">Real 1v1 Multiplayer Battle</span>
                </div>
                <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
                  {match.wager * 2} GOR Prize
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              
              {/* Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Creator</div>
                  <div className="text-slate-200 font-mono text-xs md:text-sm break-all">
                    {match.creator_wallet.slice(0, 8)}...{match.creator_wallet.slice(-6)}
                  </div>
                  {isCreator && <Badge className="mt-2 bg-purple-600">You</Badge>}
                  {/* Show deposit status */}
                  <div className="mt-2">
                    <Badge className={creatorDeposited ? 'bg-green-600' : 'bg-red-600'}>
                      {creatorDeposited ? '✅ Deposited' : '⏳ Pending'}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Opponent</div>
                  <div className="text-slate-200 font-mono text-xs md:text-sm break-all">
                    {match.opponent_wallet 
                      ? `${match.opponent_wallet.slice(0, 8)}...${match.opponent_wallet.slice(-6)}`
                      : 'Waiting for opponent...'
                    }
                  </div>
                  {match.opponent_wallet === walletAddress && <Badge className="mt-2 bg-purple-600">You</Badge>}
                  {/* Show deposit status only if opponent exists */}
                  {match.opponent_wallet && (
                    <div className="mt-2">
                      <Badge className={opponentDeposited ? 'bg-green-600' : 'bg-red-600'}>
                        {opponentDeposited ? '✅ Deposited' : '⏳ Pending'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Info */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Coins className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                  </div>
                  <div className="text-base md:text-lg font-bold text-white">{match.wager}</div>
                  <div className="text-xs text-slate-400">GOR Each</div>
                </div>
                
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  </div>
                  <div className="text-base md:text-lg font-bold text-white">1v1</div>
                  <div className="text-xs text-slate-400">Real Players</div>
                </div>
                
                <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                  </div>
                  <div className="text-base md:text-lg font-bold text-white">30s</div>
                  <div className="text-xs text-slate-400">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimized Wager Actions - now with WebSocket support */}
          <WagerActions 
            matchId={matchId!} 
            match={match} 
            walletAddress={walletAddress!} 
          />

          {/* Creator waiting message */}
          {isCreator && isWaitingForOpponent && (
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl mt-6">
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-base md:text-lg text-slate-200">
                  🔗 Share this link with your opponent:
                </div>
                <div className="bg-slate-700/60 border border-slate-600/40 rounded-lg p-3 text-xs md:text-sm text-slate-300 font-mono break-all">
                  {window.location.href}
                </div>
                <div className="text-amber-400 text-sm flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  ⏳ Waiting for opponent to join and deposit...
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
