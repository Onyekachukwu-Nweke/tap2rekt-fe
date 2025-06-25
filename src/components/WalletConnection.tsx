
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Copy, LogOut, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [gorbBalance, setGorbBalance] = useState(1250);
  const { toast } = useToast();

  // Mock wallet connection - in real app this would integrate with Solana wallet adapter
  const connectWallet = async () => {
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = 'GorB' + Math.random().toString(36).substring(2, 15);
      setWalletAddress(mockAddress);
      setIsConnected(true);
      setGorbBalance(Math.floor(Math.random() * 2000) + 500);
      
      toast({
        title: "Wallet Connected!",
        description: "Ready to play on Gorbagana testnet",
      });
    }, 1000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setGorbBalance(0);
    
    toast({
      title: "Wallet Disconnected",
      description: "You've been disconnected from the testnet",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet}
        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Balance Display */}
      <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
        {gorbBalance.toLocaleString()} GORB
      </Badge>

      {/* Wallet Info Card */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400">Gorbagana Testnet</div>
              <div className="text-sm font-mono text-white truncate">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectWallet}
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnection;
