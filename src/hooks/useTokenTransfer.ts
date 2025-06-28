
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Central vault wallet (escrow account) - replace with your actual vault address
export const VAULT_WALLET = new PublicKey('D43EdL89Em2dit7esTywBGgmTgJafguwQ5qxjQrqBrKg');

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
      // Convert GOR amount to lamports (1 GOR = 1 SOL = 1,000,000,000 lamports)
      const lamports = amount * LAMPORTS_PER_SOL;

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toAddress,
        lamports,
      });

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
        description: `Successfully transferred ${amount} GOR`,
      });

      return signature;
    } catch (error) {
      console.error('Token transfer failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Transfer failed';
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
      console.log('Getting balance for wallet:', targetWallet.toBase58());
      console.log('Connection endpoint:', connection.rpcEndpoint);
      
      // Get SOL balance directly
      const balance = await connection.getBalance(targetWallet);
      const balanceInGOR = balance / LAMPORTS_PER_SOL;

      console.log('Balance in lamports:', balance);
      console.log('Balance in GOR:', balanceInGOR);
      
      return balanceInGOR;
    } catch (error) {
      console.error('Failed to get balance:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        wallet: targetWallet.toBase58(),
      });
      
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
