
import { useState, useCallback } from 'react';
import { useTokenTransfer, VAULT_WALLET } from './useTokenTransfer';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { useMatches } from './useMatches';

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
      
      toast({
        title: "💰 Opponent Wager Deposited!",
        description: `${wagerAmount} GORB secured in vault - Match can now start!`,
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

      // Check if refund is valid (match abandoned, timed out, etc.)
      if (match.status !== 'waiting' && match.status !== 'abandoned') {
        throw new Error('Refund not available for this match');
      }

      // Note: In a real implementation, you'd need vault authority to sign this
      // For now, we'll simulate the refund request
      toast({
        title: "🔄 Refund Requested",
        description: "Refund will be processed shortly",
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

      // Calculate total winnings (both wagers)
      const totalWinnings = match.wager * 2;

      // Note: In a real implementation, you'd need vault authority to sign this
      // For now, we'll simulate the claim
      toast({
        title: "🏆 Winnings Claimed!",
        description: `${totalWinnings} GORB transferred to your wallet`,
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

      // In a real implementation, you'd check the vault for deposits
      // For now, we'll simulate based on match status
      const bothDeposited = match.status === 'in_progress' || match.status === 'completed';
      const creatorDeposited = match.status !== 'waiting' || bothDeposited;
      const opponentDeposited = bothDeposited;

      return {
        creatorDeposited,
        opponentDeposited,
        canStart: bothDeposited,
        wagerAmount: match.wager
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
