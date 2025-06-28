
import { useState, useCallback } from 'react';
import { useTokenTransfer, VAULT_WALLET } from './useTokenTransfer';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { useMatches } from './useMatches';
import { supabase } from '@/integrations/supabase/client';

export const useWagerSystem = () => {
  const [processingWager, setProcessingWager] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingClaim, setProcessingClaim] = useState(false);
  const { transferTokens, getTokenBalance, loading: transferLoading } = useTokenTransfer();
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { getMatch } = useMatches();

  const depositCreatorWager = useCallback(async (matchId: string, wagerAmount: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setProcessingWager(true);
    
    try {
      // Check if user has sufficient balance
      const balance = await getTokenBalance();
      if (balance < wagerAmount) {
        throw new Error(`Insufficient GORB balance. Need ${wagerAmount}, have ${balance.toFixed(4)}`);
      }

      // Transfer creator's wager to vault
      const signature = await transferTokens(VAULT_WALLET, wagerAmount, 'wager');
      
      // Update match to mark creator deposit as confirmed
      await supabase
        .from('matches')
        .update({ 
          creator_deposit_confirmed: true,
          creator_deposit_signature: signature 
        })
        .eq('id', matchId);

      toast({
        title: "💰 Creator Wager Deposited!",
        description: `${wagerAmount} GORB secured in vault`,
      });

      return signature;
    } catch (error) {
      console.error('Creator wager deposit failed:', error);
      throw error;
    } finally {
      setProcessingWager(false);
    }
  }, [publicKey, transferTokens, getTokenBalance, toast]);

  const depositOpponentWager = useCallback(async (matchId: string, wagerAmount: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setProcessingWager(true);
    
    try {
      // Check if user has sufficient balance
      const balance = await getTokenBalance();
      if (balance < wagerAmount) {
        throw new Error(`Insufficient GORB balance. Need ${wagerAmount}, have ${balance.toFixed(4)}`);
      }

      // Transfer opponent's wager to vault
      const signature = await transferTokens(VAULT_WALLET, wagerAmount, 'wager');
      
      // Update match to mark opponent deposit as confirmed and start the match
      const { data: updatedMatch, error } = await supabase
        .from('matches')
        .update({ 
          opponent_deposit_confirmed: true,
          opponent_deposit_signature: signature,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update match status: ${error.message}`);
      }
      
      toast({
        title: "💰 Opponent Wager Deposited!",
        description: `${wagerAmount} GORB secured in vault - Match starting now!`,
      });

      return signature;
    } catch (error) {
      console.error('Opponent wager deposit failed:', error);
      throw error;
    } finally {
      setProcessingWager(false);
    }
  }, [publicKey, transferTokens, getTokenBalance, toast]);

  const requestRefund = useCallback(async (matchId: string) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setProcessingRefund(true);
    
    try {
      const match = await getMatch(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      // Check if refund is valid (match abandoned, timed out, only one deposit, etc.)
      if (match.status !== 'waiting' && match.status !== 'abandoned') {
        throw new Error('Refund not available for this match');
      }

      // Mark match as abandoned for refund processing
      await supabase
        .from('matches')
        .update({ 
          status: 'abandoned',
          completed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      // Note: In a real implementation, you'd need vault authority to sign this
      // For now, we'll simulate the refund request
      toast({
        title: "🔄 Refund Requested",
        description: "Match abandoned - refund will be processed shortly",
      });

      return true;
    } catch (error) {
      console.error('Refund request failed:', error);
      throw error;
    } finally {
      setProcessingRefund(false);
    }
  }, [publicKey, getMatch, toast]);

  const claimWinnings = useCallback(async (matchId: string) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setProcessingClaim(true);
    
    try {
      const match = await getMatch(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      if (match.status !== 'completed') {
        throw new Error('Match not completed yet');
      }

      if (match.winner_wallet !== publicKey.toBase58()) {
        throw new Error('You are not the winner of this match');
      }

      if (match.winnings_claimed) {
        throw new Error('Winnings already claimed');
      }

      // Calculate total winnings (both wagers)
      const totalWinnings = match.wager * 2;

      // In a real implementation, you'd transfer from vault to winner
      // For now, we'll simulate by transferring from a test wallet
      // const signature = await transferTokens(publicKey, totalWinnings, 'winnings');

      // Mark winnings as claimed
      await supabase
        .from('matches')
        .update({ 
          winnings_claimed: true,
          winnings_claimed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      toast({
        title: "🏆 Winnings Claimed!",
        description: `${totalWinnings} GORB will be transferred to your wallet`,
      });

      return true;
    } catch (error) {
      console.error('Claim winnings failed:', error);
      throw error;
    } finally {
      setProcessingClaim(false);
    }
  }, [publicKey, getMatch, toast]);

  const checkWagerStatus = useCallback(async (matchId: string) => {
    try {
      const match = await getMatch(matchId);
      if (!match) return null;

      const creatorDeposited = match.creator_deposit_confirmed || false;
      const opponentDeposited = match.opponent_deposit_confirmed || false;
      const bothDeposited = creatorDeposited && opponentDeposited;
      const canStart = bothDeposited && match.status === 'waiting';

      return {
        creatorDeposited,
        opponentDeposited,
        canStart,
        bothDeposited,
        wagerAmount: match.wager,
        canClaim: match.status === 'completed' && match.winner_wallet && !match.winnings_claimed
      };
    } catch (error) {
      console.error('Failed to check wager status:', error);
      return null;
    }
  }, [getMatch]);

  return {
    depositCreatorWager,
    depositOpponentWager,
    requestRefund,
    claimWinnings,
    checkWagerStatus,
    processingWager,
    processingRefund,
    processingClaim,
    loading: transferLoading
  };
};
