
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, ArrowRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWagerSystem } from '@/hooks/useWagerSystem';
import { useTokenTransfer } from '@/hooks/useTokenTransfer';
import { useMatchLobby } from '@/hooks/useMatchLobby';
import { useMatchLobbyWebSocket } from '@/hooks/useMatchLobbyWebSocket';
import { supabase } from '@/integrations/supabase/client';

interface WagerActionsProps {
  matchId: string;
  match: any;
  walletAddress: string;
}

const WagerActions = ({ matchId, match, walletAddress }: WagerActionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { depositCreatorWager, depositOpponentWager } = useWagerSystem();
  const { getTokenBalance } = useTokenTransfer();
  const { refetch } = useMatchLobby(matchId, walletAddress);
  const { sendMessage } = useMatchLobbyWebSocket(
    matchId, 
    walletAddress, 
    match?.creator_wallet === walletAddress ? 'creator' : 'opponent'
  );

  const isCreator = match?.creator_wallet === walletAddress;
  const isOpponent = match?.opponent_wallet === walletAddress;
  const isPlayerInMatch = isCreator || isOpponent;
  const canJoin = !isPlayerInMatch && match?.status === 'waiting' && !match?.opponent_wallet;

  const handleJoinMatch = async () => {
    if (!walletAddress || isProcessing) return;

    setIsProcessing(true);
    try {
      const balance = await getTokenBalance();
      if (balance < match.wager) {
        throw new Error(`Insufficient balance. You need ${match.wager} GOR but only have ${balance} GOR`);
      }

      // Update match to add opponent
      await supabase
        .from('matches')
        .update({ opponent_wallet: walletAddress })
        .eq('id', matchId);

      await refetch();
      
      toast({
        title: "✅ Joined Match!",
        description: "You've successfully joined the battle. Now deposit your wager to start!",
      });
    } catch (error) {
      console.error('Error joining match:', error);
      toast({
        title: "❌ Join Failed",
        description: error instanceof Error ? error.message : "Failed to join match",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepositWager = async () => {
    if (!walletAddress || isProcessing) return;

    setIsProcessing(true);
    try {
      const balance = await getTokenBalance();
      if (balance < match.wager) {
        throw new Error(`Insufficient balance. You need ${match.wager} GOR but only have ${balance} GOR`);
      }

      const onDepositConfirmed = () => {
        // Send WebSocket message to notify lobby about deposit
        sendMessage('deposit_made', { 
          lobbyId: matchId, 
          wallet: walletAddress 
        });
      };

      if (isCreator) {
        await depositCreatorWager(matchId, match.wager, onDepositConfirmed);
      } else if (isOpponent) {
        await depositOpponentWager(matchId, match.wager, onDepositConfirmed);
      }
      
      await refetch();
    } catch (error) {
      console.error('Error depositing wager:', error);
      toast({
        title: "❌ Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to deposit wager",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show actions if match is completed
  if (match?.status === 'completed') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-xl">
      <CardContent className="p-4 md:p-6">
        {/* Join Match Action */}
        {canJoin && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-slate-200">
                Ready to join this epic battle?
              </div>
              <div className="text-sm text-slate-400">
                You'll need to deposit {match.wager} GOR to participate
              </div>
            </div>
            
            <Button 
              onClick={handleJoinMatch}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Joining Battle...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Join Battle ({match.wager} GOR)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Deposit Actions for Players */}
        {isPlayerInMatch && match?.status === 'waiting' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creator Deposit Status */}
              <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-300">Creator Deposit</div>
                  <Badge className={match.creator_deposit_confirmed ? 'bg-green-600' : 'bg-amber-600'}>
                    {match.creator_deposit_confirmed ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-white flex items-center">
                  <Coins className="w-4 h-4 mr-2 text-amber-400" />
                  {match.wager} GOR
                </div>
              </div>

              {/* Opponent Deposit Status */}
              <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-300">Opponent Deposit</div>
                  <Badge className={match.opponent_deposit_confirmed ? 'bg-green-600' : 'bg-amber-600'}>
                    {match.opponent_deposit_confirmed ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-white flex items-center">
                  <Coins className="w-4 h-4 mr-2 text-amber-400" />
                  {match.wager} GOR
                </div>
              </div>
            </div>

            {/* Deposit Button */}
            {((isCreator && !match.creator_deposit_confirmed) || 
              (isOpponent && !match.opponent_deposit_confirmed)) && (
              <Button 
                onClick={handleDepositWager}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5 mr-2" />
                    Deposit {match.wager} GOR
                  </>
                )}
              </Button>
            )}

            {/* Waiting Message */}
            {((isCreator && match.creator_deposit_confirmed) || 
              (isOpponent && match.opponent_deposit_confirmed)) && (
              <div className="text-center py-4">
                <div className="text-amber-400 text-lg font-medium mb-2">
                  ✅ Your deposit is confirmed!
                </div>
                <div className="text-slate-400">
                  {!(match.creator_deposit_confirmed && match.opponent_deposit_confirmed) 
                    ? "Waiting for opponent to deposit..." 
                    : "Both players ready - battle starting soon!"}
                </div>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default WagerActions;
