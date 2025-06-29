
import { useState, useCallback } from 'react';
import bs58 from 'bs58';
import { 
  Keypair, 
  PublicKey, 
  Connection, 
  SystemProgram, 
  Transaction, 
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { useMatches } from './useMatches';
import { supabase } from '@/integrations/supabase/client';

export const useClaimWinnings = () => {
  const [claiming, setClaiming] = useState(false);
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { getMatch } = useMatches();

  const claimWinnings = useCallback(async (matchId: string) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setClaiming(true);
    
    try {
      // 1. Verify match exists and get current state
      const match = await getMatch(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      // 2. Verify match is completed
      if (match.status !== 'completed') {
        throw new Error('Match is not completed yet');
      }

      // 3. Verify there is a winner
      if (!match.winner_wallet) {
        throw new Error('No winner determined for this match');
      }

      // 4. Verify current user is the winner
      if (match.winner_wallet !== publicKey.toBase58()) {
        throw new Error('You are not the winner of this match');
      }

      // 5. Verify winnings haven't been claimed already
      if (match.winnings_claimed) {
        throw new Error('Winnings have already been claimed');
      }

      // 6. Verify both deposits were confirmed (security check)
      if (!match.creator_deposit_confirmed || !match.opponent_deposit_confirmed) {
        throw new Error('Invalid match state - deposits not properly confirmed');
      }

      // 7. Calculate total winnings (both wagers go to winner)
      const totalWinnings = match.wager * 2;

      // 8. Mark as claiming in progress to prevent double claims
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          winnings_claimed: true,
          winnings_claimed_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .eq('winner_wallet', publicKey.toBase58())
        .eq('winnings_claimed', false);

      if (updateError) {
        throw new Error(`Failed to update claim status: ${updateError.message}`);
      }

      // 9. Transfer winnings from vault to winner
      const vaultPrivateKeyBase58 = import.meta.env.VITE_VAULT_PRIVATE_KEY;
      if (!vaultPrivateKeyBase58) {
        throw new Error('Vault private key not configured');
      }

      const vaultKeypair = Keypair.fromSecretKey(bs58.decode(vaultPrivateKeyBase58));
      const connection = new Connection(import.meta.env.VITE_RPC_ENDPOINT || 'https://rpc.gorbagana.wtf', 'confirmed');
      const winnerPublicKey = new PublicKey(match.winner_wallet);

      const lamports = Math.floor(totalWinnings * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: vaultKeypair.publicKey,
          toPubkey: winnerPublicKey,
          lamports
        })
      );

      transaction.feePayer = vaultKeypair.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      // Sign transaction with vault keypair
      transaction.sign(vaultKeypair);

      // Send raw transaction
      const rawTx = transaction.serialize();
      const signature = await connection.sendRawTransaction(rawTx, { skipPreflight: false });

      // Optionally poll for confirmation
      const confirmation = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
      console.log('Winnings claim confirmed:', confirmation);

      const result = confirmation.value;
      if (result?.confirmationStatus !== 'confirmed' && result?.confirmationStatus !== 'finalized') {
        console.log("Winnings claim not confirmed");
        throw new Error(`Winnings claim not confirmed: ${JSON.stringify(result)}`);
      }

      if (confirmation.value?.err) {
        console.log("Winnings claim failed");
        throw new Error(`Winnings claim failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      toast({
        title: "🏆 Winnings Claimed!",
        description: `${totalWinnings} GOR has been transferred to your wallet`,
      });

      return {
        success: true,
        amount: totalWinnings,
        signature
      };

    } catch (error) {
      console.error('Claim winnings failed:', error);
      
      // Rollback the claim status if transfer failed
      try {
        await supabase
          .from('matches')
          .update({ 
            winnings_claimed: false,
            winnings_claimed_at: null
          })
          .eq('id', matchId)
          .eq('winner_wallet', publicKey.toBase58());
      } catch (rollbackError) {
        console.error('Failed to rollback claim status:', rollbackError);
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to claim winnings';
      toast({
        title: "❌ Claim Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setClaiming(false);
    }
  }, [publicKey, toast, getMatch]);

  const checkClaimEligibility = useCallback(async (matchId: string) => {
    if (!publicKey) {
      return {
        canClaim: false,
        reason: 'Wallet not connected'
      };
    }

    try {
      const match = await getMatch(matchId);
      if (!match) {
        return {
          canClaim: false,
          reason: 'Match not found'
        };
      }

      if (match.status !== 'completed') {
        return {
          canClaim: false,
          reason: 'Match not completed'
        };
      }

      if (!match.winner_wallet) {
        return {
          canClaim: false,
          reason: 'No winner determined'
        };
      }

      if (match.winner_wallet !== publicKey.toBase58()) {
        return {
          canClaim: false,
          reason: 'You are not the winner'
        };
      }

      if (match.winnings_claimed) {
        return {
          canClaim: false,
          reason: 'Winnings already claimed',
          alreadyClaimed: true
        };
      }

      return {
        canClaim: true,
        winningsAmount: match.wager * 2,
        match
      };
    } catch (error) {
      console.error('Failed to check claim eligibility:', error);
      return {
        canClaim: false,
        reason: 'Failed to check eligibility'
      };
    }
  }, [publicKey, getMatch]);

  return {
    claimWinnings,
    checkClaimEligibility,
    claiming
  };
};
