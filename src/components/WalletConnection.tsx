
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Copy, LogOut, ExternalLink, Sparkles, Zap } from 'lucide-react';
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
        title: "🎉 Wallet Connected!",
        description: "Ready to dominate on Gorbagana testnet! 🚀",
      });
    }, 1000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setGorbBalance(0);
    
    toast({
      title: "👋 Wallet Disconnected",
      description: "Come back soon, champion!",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "📋 Address Copied!",
      description: "Wallet address copied to clipboard ✨",
    });
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 transform hover:scale-105 transition-all duration-300 border border-purple-500/50"
      >
        <Wallet className="w-5 h-5 mr-2" />
        🚀 Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Enhanced Balance Display */}
      <Badge 
        variant="outline" 
        className="border-green-500/70 text-green-300 bg-gradient-to-r from-green-900/60 to-emerald-900/60 backdrop-blur-sm px-4 py-2 text-lg font-bold shadow-lg shadow-green-500/25 animate-pulse"
      >
        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
        {gorbBalance.toLocaleString()} GORB 💰
      </Badge>

      {/* Enhanced Wallet Info Card */}
      <Card className="bg-gradient-to-r from-slate-800/90 via-purple-900/50 to-slate-800/90 border-gradient-to-r border-purple-500/50 backdrop-blur-xl shadow-2xl shadow-purple-500/25 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 animate-pulse"></div>
        <CardContent className="p-4 relative">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/50 animate-pulse">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce">
                <Zap className="w-2 h-2 text-white ml-1 mt-1" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                🌟 Gorbagana Testnet
              </div>
              <div className="text-sm font-mono font-bold text-white truncate bg-gradient-to-r from-white to-purple-200 bg-clip-text">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-10 w-10 p-0 text-slate-300 hover:text-white hover:bg-purple-600/30 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectWallet}
                className="h-10 w-10 p-0 text-slate-300 hover:text-red-400 hover:bg-red-600/30 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnection;
