
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Target, Shield } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useWagerSystem } from '@/hooks/useWagerSystem';
import { useTokenTransfer } from '@/hooks/useTokenTransfer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import React from 'react';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBattleCreated?: (matchId: string) => void;
}

const CreateBattleModal = ({ isOpen, onClose, onBattleCreated }: CreateBattleModalProps) => {
  const [wager, setWager] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [balance, setBalance] = useState(0);
  const { createMatch } = useMatches();
  const { depositCreatorWager } = useWagerSystem();
  const { getTokenBalance } = useTokenTransfer();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { walletAddress, isConnected } = useWalletAddress();

  // Load balance when modal opens
  React.useEffect(() => {
    if (isOpen && isConnected) {
      const loadBalance = async () => {
        const bal = await getTokenBalance();
        setBalance(bal);
      };
      loadBalance();
    }
  }, [isOpen, isConnected, getTokenBalance]);

  const handleCreateBattle = async () => {
    if (!walletAddress || !isConnected) {
      toast({
        title: "⚠️ Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (balance < wager) {
      toast({
        title: "⚠️ Insufficient Balance",
        description: `You need ${wager} GORB to create this battle`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // First create the match
      const match = await createMatch(walletAddress, wager, false, false);
      if (match) {
        // Then deposit the creator's wager
        await depositCreatorWager(match.id, wager);
        
        if (onBattleCreated) {
          onBattleCreated(match.id);
        }
        
        toast({
          title: "🎮 Battle Created & Funded!",
          description: "Your wager is secured. Waiting for opponent...",
        });

        // Close modal and redirect to match page
        onClose();
        navigate(`/match/${match.id}`);
      }
    } catch (error) {
      console.error('Failed to create battle:', error);
      toast({
        title: "❌ Battle Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create battle",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setWager(10);
  };

  const canAfford = balance >= wager;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-600/50 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-100 flex items-center">
            <Target className="w-6 h-6 mr-3 text-purple-400" />
            Create New Battle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Balance Display */}
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Your Balance:</span>
              <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                {balance.toFixed(2)} GORB
              </Badge>
            </div>
          </div>

          {/* Battle Info */}
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
            <div className="text-center space-y-2">
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                Open Battle - 30 Second Tap Race
              </Badge>
              <p className="text-sm text-slate-300">
                Your wager will be deposited immediately upon creation
              </p>
            </div>
          </div>

          {/* Wager Amount */}
          <div className="space-y-2">
            <Label htmlFor="wager" className="text-slate-200">
              Wager Amount (GORB)
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                id="wager"
                type="number"
                min="1"
                max={Math.floor(balance)}
                value={wager}
                onChange={(e) => setWager(Number(e.target.value))}
                className="pl-10 bg-slate-700/60 border-slate-600/40 text-slate-200"
                placeholder="Enter wager amount"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">
                Winner takes {wager * 2} GORB total prize pool
              </span>
              <span className={canAfford ? "text-green-400" : "text-red-400"}>
                {canAfford ? "✅ Can afford" : "❌ Insufficient balance"}
              </span>
            </div>
          </div>

          {/* Deposit Info */}
          <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
            <div className="flex items-center text-amber-300 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Your {wager} GORB will be deposited to vault immediately
            </div>
          </div>

          <Button 
            onClick={handleCreateBattle}
            disabled={isCreating || !isConnected || !canAfford || wager < 1}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-bold py-3"
          >
            {isCreating ? 'Creating & Depositing...' : `🎮 Create & Deposit (${wager} GORB)`}
          </Button>

          {!isConnected && (
            <div className="text-center text-amber-400 text-sm">
              ⚠️ Connect your wallet to create battles
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBattleModal;
