
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  createTransferInstruction, 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// GORB Token Mint Address - Updated to correct address
export const GORB_MINT = new PublicKey('F827Dq6i32sJsfhNUVEDo3JMrNRU1GoR');

// Central vault wallet (escrow account) - replace with your actual vault address
export const VAULT_WALLET = new PublicKey('D43EdL89Em2dit7esTywBGgmTgJafguwQ5qxjQrqBrKg'); // Replace with actual vault

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

      // Get associated token addresses
      const fromTokenAddress = await getAssociatedTokenAddress(
        GORB_MINT,
        publicKey
      );

      const toTokenAddress = await getAssociatedTokenAddress(
        GORB_MINT,
        toAddress
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAddress,
        toTokenAddress,
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
      console.log('Getting token balance for wallet:', targetWallet.toBase58());
      console.log('GORB Mint (updated):', GORB_MINT.toBase58());
      console.log('Connection endpoint:', connection.rpcEndpoint);
      
      const tokenAddress = await getAssociatedTokenAddress(
        GORB_MINT,
        targetWallet
      );

      console.log('Associated token address:', tokenAddress.toBase58());

      // Check if the token account exists first
      const accountInfo = await connection.getAccountInfo(tokenAddress);
      
      if (!accountInfo) {
        console.log('Token account does not exist yet, balance is 0');
        return 0;
      }

      console.log('Account info found, fetching balance...');
      const balance = await connection.getTokenAccountBalance(tokenAddress);
      console.log('Token balance response:', balance);
      
      const uiAmount = balance.value.uiAmount;
      console.log('UI Amount:', uiAmount);
      
      return parseFloat(uiAmount?.toString() || '0');
    } catch (error) {
      console.error('Failed to get token balance:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        wallet: targetWallet.toBase58(),
        mint: GORB_MINT.toBase58()
      });
      
      // If it's a "could not find account" error, return 0 instead of throwing
      if (error instanceof Error && error.message.includes('could not find account')) {
        console.log('Token account not found, returning balance of 0');
        return 0;
      }
      
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
