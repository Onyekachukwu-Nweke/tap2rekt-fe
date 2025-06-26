
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Target } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useWalletAddress } from '@/hooks/useWalletAddress';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBattleCreated?: (matchId: string) => void;
}

const CreateBattleModal = ({ isOpen, onClose, onBattleCreated }: CreateBattleModalProps) => {
  const [wager, setWager] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const { createMatch } = useMatches();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { walletAddress, isConnected } = useWalletAddress();

  const handleCreateBattle = async () => {
    if (!walletAddress || !isConnected) {
      toast({
        title: "⚠️ Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // All games are now public (not private), anyone can join if they can pay the wager
      const match = await createMatch(walletAddress, wager, false, false);
      if (match) {
        if (onBattleCreated) {
          onBattleCreated(match.id);
        }
        
        toast({
          title: "🎮 Battle Created!",
          description: "Waiting for opponent to join...",
        });

        // Close modal and redirect to match page
        onClose();
        navigate(`/match/${match.id}`);
      }
    } catch (error) {
      console.error('Failed to create battle:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setWager(10);
  };

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
          {/* Battle Info */}
          <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
            <div className="text-center space-y-2">
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                Open Battle - 30 Second Tap Race
              </Badge>
              <p className="text-sm text-slate-300">
                Anyone can join if they match your wager amount
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
                value={wager}
                onChange={(e) => setWager(Number(e.target.value))}
                className="pl-10 bg-slate-700/60 border-slate-600/40 text-slate-200"
                placeholder="Enter wager amount"
              />
            </div>
            <p className="text-xs text-slate-400">
              Winner takes {wager * 2} GORB total prize pool
            </p>
          </div>

          <Button 
            onClick={handleCreateBattle}
            disabled={isCreating || !isConnected || wager < 1}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-bold py-3"
          >
            {isCreating ? 'Creating Battle...' : `🎮 Create Battle (${wager} GORB)`}
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
