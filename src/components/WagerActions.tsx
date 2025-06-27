
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Shield, Trophy, RefreshCw } from 'lucide-react';
import { useWagerSystem } from '@/hooks/useWagerSystem';
import { useTokenTransfer } from '@/hooks/useTokenTransfer';
import { useWallet } from '@solana/wallet-adapter-react';

interface WagerActionsProps {
  matchId: string;
  match: any;
  walletAddress: string;
}

const WagerActions = ({ matchId, match, walletAddress }: WagerActionsProps) => {
  const [balance, setBalance] = useState(0);
  const [wagerStatus, setWagerStatus] = useState<any>(null);
  const { 
    depositWager, 
    requestRefund, 
    claimWinnings, 
    checkWagerStatus,
    processingWager,
    processingRefund,
    processingClaim 
  } = useWagerSystem();
  const { getTokenBalance } = useTokenTransfer();
  const { connected } = useWallet();

  const isCreator = match.creator_wallet === walletAddress;
  const isOpponent = match.opponent_wallet === walletAddress;
  const isPlayer = isCreator || isOpponent;
  const isWinner = match.winner_wallet === walletAddress;

  useEffect(() => {
    const loadData = async () => {
      if (connected) {
        const bal = await getTokenBalance();
        setBalance(bal);
        
        const status = await checkWagerStatus(matchId);
        setWagerStatus(status);
      }
    };
    
    loadData();
  }, [connected, matchId, getTokenBalance, checkWagerStatus]);

  const handleDepositWager = async () => {
    try {
      await depositWager(matchId, match.wager);
      // Refresh status after deposit
      const status = await checkWagerStatus(matchId);
      setWagerStatus(status);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleRequestRefund = async () => {
    try {
      await requestRefund(matchId);
    } catch (error) {
      console.error('Refund failed:', error);
    }
  };

  const handleClaimWinnings = async () => {
    try {
      await claimWinnings(matchId);
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  if (!isPlayer) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-amber-400" />
            Web3 Wager System
          </div>
          <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            {balance.toFixed(2)} GORB
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Wager Status */}
        {wagerStatus && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3 text-center">
              <div className="text-sm text-slate-400 mb-1">Creator Wager</div>
              <Badge className={wagerStatus.creatorDeposited ? 'bg-green-600' : 'bg-red-600'}>
                {wagerStatus.creatorDeposited ? '✅ Deposited' : '❌ Pending'}
              </Badge>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-3 text-center">
              <div className="text-sm text-slate-400 mb-1">Opponent Wager</div>
              <Badge className={wagerStatus.opponentDeposited ? 'bg-green-600' : 'bg-red-600'}>
                {wagerStatus.opponentDeposited ? '✅ Deposited' : '❌ Pending'}
              </Badge>
            </div>
          </div>
        )}

        {/* Actions based on match status */}
        <div className="space-y-3">
          
          {/* Deposit Wager */}
          {match.status === 'waiting' && (
            <Button
              onClick={handleDepositWager}
              disabled={processingWager || balance < match.wager}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {processingWager ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Deposit Wager ({match.wager} GORB)
                </>
              )}
            </Button>
          )}

          {/* Request Refund */}
          {(match.status === 'waiting' || match.status === 'abandoned') && (
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
          {match.status === 'completed' && isWinner && (
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
          )}

          {/* Balance Warning */}
          {balance < match.wager && (
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 text-center">
              <div className="text-amber-300 text-sm">
                ⚠️ Insufficient GORB balance to participate
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WagerActions;
