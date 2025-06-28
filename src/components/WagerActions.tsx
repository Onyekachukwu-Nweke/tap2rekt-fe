
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Shield, Trophy, RefreshCw, Users, Play, AlertTriangle } from 'lucide-react';
import { useWagerSystem } from '@/hooks/useWagerSystem';
import { useMatches } from '@/hooks/useMatches';
import { useMatchLobby } from '@/hooks/useMatchLobby';
import { useMatchLobbyWebSocket } from '@/hooks/useMatchLobbyWebSocket';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';

interface WagerActionsProps {
  matchId: string;
  match: any;
  walletAddress: string;
}

const WagerActions = ({ matchId, match, walletAddress }: WagerActionsProps) => {
  const [joiningAndDepositing, setJoiningAndDepositing] = useState(false);
  
  // Use optimized hooks
  const { balance, wagerStatus, refetch } = useMatchLobby(matchId, walletAddress);
  const { isConnected, lobbyState, sendMessage } = useMatchLobbyWebSocket(
    matchId, 
    walletAddress, 
    match.creator_wallet === walletAddress ? 'creator' : 'opponent'
  );
  
  const { 
    depositCreatorWager,
    depositOpponentWager, 
    requestRefund, 
    claimWinnings,
    processingWager,
    processingRefund,
    processingClaim 
  } = useWagerSystem();
  const { joinMatch } = useMatches();
  const { connected } = useWallet();
  const { toast } = useToast();

  const isCreator = match.creator_wallet === walletAddress;
  const isOpponent = match.opponent_wallet === walletAddress;
  const isPlayer = isCreator || isOpponent;
  const isWinner = match.winner_wallet === walletAddress;
  const canJoin = !isPlayer && match.status === 'waiting' && !match.opponent_wallet;

  // Get actual deposit status from match data
  const creatorDeposited = match.creator_deposit_confirmed || false;
  const opponentDeposited = match.opponent_deposit_confirmed || false;
  const bothDeposited = creatorDeposited && opponentDeposited;

  const handleJoinAndDeposit = async () => {
    if (balance < match.wager) {
      toast({
        title: "⚠️ Insufficient Balance",
        description: `You need ${match.wager} GORB to join this battle`,
        variant: "destructive"
      });
      return;
    }

    setJoiningAndDepositing(true);
    try {
      // First join the match
      await joinMatch(matchId, walletAddress);
      
      // Then deposit the wager (this will also start the match if creator deposited)
      await depositOpponentWager(matchId, match.wager);
      
      // Notify WebSocket about deposit
      sendMessage('deposit_made', {
        role: 'opponent',
        amount: match.wager
      });
      
      await refetch();
      
      toast({
        title: "⚡ Joined & Deposited!",
        description: "Deposit confirmed - waiting for match to start!",
      });
    } catch (error) {
      console.error('Join and deposit failed:', error);
      toast({
        title: "❌ Join Failed",
        description: error instanceof Error ? error.message : "Failed to join battle",
        variant: "destructive"
      });
    } finally {
      setJoiningAndDepositing(false);
    }
  };

  const handleDepositCreatorWager = async () => {
    if (balance < match.wager) {
      toast({
        title: "⚠️ Insufficient Balance",
        description: `You need ${match.wager} GORB to deposit`,
        variant: "destructive"
      });
      return;
    }

    try {
      await depositCreatorWager(matchId, match.wager);
      
      // Notify WebSocket about deposit
      sendMessage('deposit_made', {
        role: 'creator',
        amount: match.wager
      });
      
      await refetch();
    } catch (error) {
      console.error('Creator deposit failed:', error);
    }
  };

  const handleDepositOpponentWager = async () => {
    if (balance < match.wager) {
      toast({
        title: "⚠️ Insufficient Balance",
        description: `You need ${match.wager} GORB to deposit`,
        variant: "destructive"
      });
      return;
    }

    try {
      await depositOpponentWager(matchId, match.wager);
      
      // Notify WebSocket about deposit
      sendMessage('deposit_made', {
        role: 'opponent',
        amount: match.wager
      });
      
      await refetch();
    } catch (error) {
      console.error('Opponent deposit failed:', error);
    }
  };

  const handleRequestRefund = async () => {
    try {
      await requestRefund(matchId);
      await refetch();
    } catch (error) {
      console.error('Refund failed:', error);
    }
  };

  const handleClaimWinnings = async () => {
    try {
      await claimWinnings(matchId);
      await refetch();
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  if (!isPlayer && !canJoin) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-amber-400" />
            Wager System
            {isConnected && (
              <Badge className="ml-2 bg-emerald-600 text-xs">
                🔴 LIVE
              </Badge>
            )}
          </div>
          <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            {balance.toFixed(4)} GORB
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* WebSocket Status */}
        {isPlayer && (
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-300">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                {isConnected ? 'Real-time updates active' : 'Connecting...'}
              </div>
              <div className="text-slate-400">
                Players: {lobbyState.playerCount}/2
              </div>
            </div>
          </div>
        )}

        {/* Deposit Status Display */}
        {isPlayer && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3 text-center">
              <div className="text-sm text-slate-400 mb-1">Creator Deposit</div>
              <Badge className={creatorDeposited ? 'bg-green-600' : 'bg-red-600'}>
                {creatorDeposited ? '✅ Confirmed' : '❌ Pending'}
              </Badge>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3 text-center">
              <div className="text-sm text-slate-400 mb-1">Opponent Deposit</div>
              <Badge className={opponentDeposited ? 'bg-green-600' : 'bg-red-600'}>
                {opponentDeposited ? '✅ Confirmed' : '❌ Pending'}
              </Badge>
            </div>
          </div>
        )}

        {/* Critical Warning for Match Status Mismatch */}
        {match.status === 'in_progress' && !bothDeposited && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
            <div className="flex items-center text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Warning: Match started without both deposits confirmed!
            </div>
          </div>
        )}

        {/* Actions based on match status */}
        <div className="space-y-3">
          
          {/* Join & Deposit (for non-players) */}
          {canJoin && (
            <div className="space-y-3">
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                <div className="flex items-center text-blue-300 text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Joining requires immediate {match.wager} GORB deposit
                </div>
              </div>
              <Button
                onClick={handleJoinAndDeposit}
                disabled={joiningAndDepositing || processingWager || balance < match.wager}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {joiningAndDepositing || processingWager ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Joining & Depositing...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join & Deposit ({match.wager} GORB)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Creator needs to deposit */}
          {isCreator && !creatorDeposited && match.status === 'waiting' && (
            <div className="space-y-3">
              <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
                <div className="flex items-center text-purple-300 text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  You must deposit your {match.wager} GORB wager first
                </div>
              </div>
              <Button
                onClick={handleDepositCreatorWager}
                disabled={processingWager || balance < match.wager}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {processingWager ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Depositing...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Deposit Wager ({match.wager} GORB)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Opponent needs to deposit (only show if opponent has joined and creator deposited) */}
          {isOpponent && !opponentDeposited && match.status === 'waiting' && creatorDeposited && (
            <div className="space-y-3">
              <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-3">
                <div className="flex items-center text-emerald-300 text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Deposit your {match.wager} GORB wager to start the battle
                </div>
              </div>
              <Button
                onClick={handleDepositOpponentWager}
                disabled={processingWager || balance < match.wager}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {processingWager ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Depositing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Deposit & Start Battle ({match.wager} GORB)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Waiting for creator to deposit */}
          {isOpponent && !creatorDeposited && match.status === 'waiting' && (
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 text-center">
              <div className="text-amber-300 text-sm">
                ⏳ Waiting for creator to deposit their wager first
              </div>
            </div>
          )}

          {/* Both deposits confirmed - ready to start */}
          {isPlayer && bothDeposited && match.status === 'waiting' && (
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
              <div className="text-green-300 text-sm font-medium">
                ✅ Both deposits confirmed - Battle will start automatically!
              </div>
            </div>
          )}

          {/* Request Refund */}
          {isPlayer && (match.status === 'waiting' || match.status === 'abandoned') && (
            <Button
              onClick={handleRequestRefund}
              disabled={processingRefund}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {processingRefund ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Refund
                </>
              )}
            </Button>
          )}

          {/* Claim Winnings */}
          {match.status === 'completed' && isWinner && !match.winnings_claimed && (
            <div className="space-y-3">
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center">
                <div className="text-green-300 text-sm font-medium">
                  🏆 Congratulations! You won this battle!
                </div>
              </div>
              <Button
                onClick={handleClaimWinnings}
                disabled={processingClaim}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {processingClaim ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Claim Winnings ({match.wager * 2} GORB)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Winnings Already Claimed */}
          {match.status === 'completed' && isWinner && match.winnings_claimed && (
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3 text-center">
              <div className="text-slate-300 text-sm">
                ✅ Winnings already claimed
              </div>
            </div>
          )}

          {/* Balance Warning */}
          {(canJoin || (isPlayer && (
            (isCreator && !creatorDeposited) || 
            (isOpponent && !opponentDeposited && creatorDeposited)
          ))) && balance < match.wager && (
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 text-center">
              <div className="text-amber-300 text-sm">
                ⚠️ Insufficient GORB balance ({balance.toFixed(4)} / {match.wager} needed)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WagerActions;
