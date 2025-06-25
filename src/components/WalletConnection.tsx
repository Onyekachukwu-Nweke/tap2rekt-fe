
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Copy, LogOut, Sparkles, Zap } from 'lucide-react';
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
        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 border border-blue-500/30"
      >
        <Wallet className="w-5 h-5 mr-2" />
        🚀 Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Balance Display */}
      <Badge 
        variant="outline" 
        className="border-emerald-500/50 text-emerald-300 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 backdrop-blur-sm px-4 py-2 text-lg font-bold shadow-lg shadow-emerald-500/20"
      >
        <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
        {gorbBalance.toLocaleString()} GORB 💰
      </Badge>

      {/* Wallet Info Card */}
      <Card className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-slate-600/40 backdrop-blur-xl shadow-xl shadow-slate-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <CardContent className="p-4 relative">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full">
                <Zap className="w-2 h-2 text-white ml-1 mt-1" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-400">
                🌟 Gorbagana Testnet
              </div>
              <div className="text-sm font-mono font-bold text-slate-200 truncate">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-10 w-10 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectWallet}
                className="h-10 w-10 p-0 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-300 hover:scale-110"
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
