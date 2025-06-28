
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Central vault wallet (escrow account) - replace with your actual vault address
export const VAULT_WALLET = new PublicKey('D43EdL89Em2dit7esTywBGgmTgJafguwQ5qxjQrqBrKg');

export const useTokenTransfer = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Prevent multiple simultaneous balance requests
  const balanceRequestRef = useRef(false);
  const balanceCache = useRef<{ [key: string]: { balance: number; timestamp: number } }>({});
  const CACHE_DURATION = 5000; // 5 seconds cache

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
      console.log(`Initiating ${purpose} transfer:`, {
        from: publicKey.toBase58(),
        to: toAddress.toBase58(),
        amount,
        purpose
      });

      // Convert GOR amount to lamports (1 GOR = 1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toAddress,
        lamports,
      });

      // Create and send transaction
      const transaction = new Transaction().add(transferInstruction);
      
      // Get latest blockhash for better transaction reliability
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection);

      console.log('Transaction sent, confirming...', signature);
      // Wait for confirmation with timeout
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      const purposeText = {
        wager: 'Wager deposited',
        refund: 'Refund received',
        winnings: 'Winnings claimed'
      };

      toast({
        title: `✅ ${purposeText[purpose]}!`,
        description: `Successfully transferred ${amount} GOR`,
      });

      // Clear balance cache after successful transfer
      balanceCache.current = {};

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

  const getTokenBalance = useCallback(async (walletAddress?: PublicKey): Promise<number> => {
    const targetWallet = walletAddress || publicKey;
    if (!targetWallet) return 0;

    const walletKey = targetWallet.toBase58();
    const now = Date.now();

    // Check cache first
    const cached = balanceCache.current[walletKey];
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.balance;
    }

    // Prevent multiple simultaneous requests for the same wallet
    if (balanceRequestRef.current) {
      return cached?.balance || 0;
    }

    balanceRequestRef.current = true;

    try {
      console.log('Getting balance for wallet:', walletKey);
      
      // Get SOL balance directly from Gorbagana network
      const balance = await connection.getBalance(targetWallet);
      const balanceInGOR = balance / LAMPORTS_PER_SOL;

      console.log('Balance retrieved:', {
        wallet: walletKey,
        lamports: balance,
        GOR: balanceInGOR
      });

      // Cache the result
      balanceCache.current[walletKey] = {
        balance: balanceInGOR,
        timestamp: now
      };
      
      return balanceInGOR;
    } catch (error) {
      console.error('Failed to get balance:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        wallet: walletKey,
        rpcEndpoint: connection.rpcEndpoint
      });
      
      // Return cached value if available, otherwise 0
      return cached?.balance || 0;
    } finally {
      balanceRequestRef.current = false;
    }
  }, [connection, publicKey]);

  return {
    transferTokens,
    getTokenBalance,
    loading,
    isConnected: !!publicKey
  };
};
