
import { useWallet } from '@solana/wallet-adapter-react';

export const useWalletAddress = () => {
  const { connected, publicKey } = useWallet();
  
  return {
    walletAddress: connected && publicKey ? publicKey.toBase58() : null,
    isConnected: connected
  };
};
