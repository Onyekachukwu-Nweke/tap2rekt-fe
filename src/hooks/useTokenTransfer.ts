
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  createTransferInstruction, 
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// GORB Token Mint Address
export const GORB_MINT = new PublicKey('F827Dq6i32sJsfhNUVEDo4ZVkhcXYNkPo3JMrNRU1GoR');

// Central vault wallet (escrow account) - replace with your actual vault address
export const VAULT_WALLET = new PublicKey('GorbVault11111111111111111111111111111111111'); // Replace with actual vault

export const useTokenTransfer = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const transferTokens = async (
    toAddress: PublicKey, 
    amount: number,
    purpose: 'wager' | 'refund' | 'winnings' = 'wager'
  ) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    
    try {
      // Convert GORB amount to token units (assuming 9 decimals)
      const tokenAmount = BigInt(amount * Math.pow(10, 9));

      // Get or create associated token accounts
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        GORB_MINT,
        publicKey
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        GORB_MINT,
        toAddress
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        publicKey,
        tokenAmount,
        [],
        TOKEN_PROGRAM_ID
      );

      // Create and send transaction
      const transaction = new Transaction().add(transferInstruction);
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      const purposeText = {
        wager: 'Wager deposited',
        refund: 'Refund received',
        winnings: 'Winnings claimed'
      };

      toast({
        title: `✅ ${purposeText[purpose]}!`,
        description: `Successfully transferred ${amount} GORB`,
      });

      return signature;
    } catch (error) {
      console.error('Token transfer failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Token transfer failed';
      toast({
        title: "❌ Transfer Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = async (walletAddress?: PublicKey): Promise<number> => {
    const targetWallet = walletAddress || publicKey;
    if (!targetWallet) return 0;

    try {
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey || targetWallet,
        GORB_MINT,
        targetWallet
      );

      const balance = await connection.getTokenAccountBalance(tokenAccount.address);
      return parseFloat(balance.value.uiAmount?.toString() || '0');
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  };

  return {
    transferTokens,
    getTokenBalance,
    loading,
    isConnected: !!publicKey
  };
};
