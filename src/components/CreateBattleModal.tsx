
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Target, Zap, Users } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onBattleCreated?: (matchId: string) => void;
}

const CreateBattleModal = ({ isOpen, onClose, walletAddress, onBattleCreated }: CreateBattleModalProps) => {
  const [wager, setWager] = useState(10);
  const [gameMode, setGameMode] = useState<'quick' | 'private'>('quick');
  const [isCreating, setIsCreating] = useState(false);
  const { createMatch } = useMatches();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateBattle = async () => {
    if (!walletAddress) return;

    setIsCreating(true);
    try {
      const match = await createMatch(walletAddress, wager, gameMode === 'quick');
      if (match) {
        if (onBattleCreated) {
          onBattleCreated(match.id);
        }
        
        toast({
          title: gameMode === 'quick' ? "🎮 Quick Match Created!" : "🎮 Private Battle Created!",
          description: gameMode === 'quick' ? "Searching for opponent..." : "Share the link with your opponent",
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
    setGameMode('quick');
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
          {/* Game Mode Selection */}
          <div className="space-y-3">
            <Label className="text-slate-200">Game Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameMode('quick')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  gameMode === 'quick'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/40'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-slate-200 font-semibold">Quick Game</div>
                <div className="text-xs text-slate-400">Auto-match with opponent</div>
              </button>
              
              <button
                onClick={() => setGameMode('private')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  gameMode === 'private'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/40'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-slate-200 font-semibold">Private Game</div>
                <div className="text-xs text-slate-400">Share link with friend</div>
              </button>
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
          </div>

          <Button 
            onClick={handleCreateBattle}
            disabled={isCreating || !walletAddress || wager < 1}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-bold py-3"
          >
            {isCreating ? 'Creating Battle...' : `🎮 Create ${gameMode === 'quick' ? 'Quick' : 'Private'} Battle (${wager} GORB)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBattleModal;
