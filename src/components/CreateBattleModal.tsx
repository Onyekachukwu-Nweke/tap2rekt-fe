
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Target, Zap, Users, Copy, Check } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';

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
  const [createdMatch, setCreatedMatch] = useState<any>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const { createMatch } = useMatches();
  const { toast } = useToast();

  const handleCreateBattle = async () => {
    if (!walletAddress) return;

    setIsCreating(true);
    try {
      const match = await createMatch(walletAddress, wager, gameMode === 'quick');
      if (match) {
        setCreatedMatch(match);
        if (onBattleCreated) {
          onBattleCreated(match.id);
        }
        
        if (gameMode === 'quick') {
          toast({
            title: "🎮 Quick Match Created!",
            description: "Searching for opponent...",
          });
        } else {
          toast({
            title: "🎮 Private Battle Created!",
            description: "Share the link with your opponent",
          });
        }
      }
    } catch (error) {
      console.error('Failed to create battle:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getMatchLink = () => {
    if (!createdMatch) return '';
    return `${window.location.origin}/match/${createdMatch.id}`;
  };

  const handleCopyLink = async () => {
    const link = getMatchLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        
        toast({
          title: "✅ Link Copied!",
          description: "Share this link with your opponent",
        });
      } catch (error) {
        console.error('Failed to copy link:', error);
        toast({
          title: "❌ Copy Failed",
          description: "Please copy the link manually",
          variant: "destructive"
        });
      }
    }
  };

  const handleClose = () => {
    onClose();
    setCreatedMatch(null);
    setLinkCopied(false);
    setGameMode('quick');
    setWager(10);
  };

  const handleGoToMatch = () => {
    if (createdMatch) {
      window.location.href = `/match/${createdMatch.id}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-600/50 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-100 flex items-center">
            <Target className="w-6 h-6 mr-3 text-purple-400" />
            {createdMatch ? 'Battle Created!' : 'Create New Battle'}
          </DialogTitle>
        </DialogHeader>

        {!createdMatch ? (
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
        ) : (
          <div className="space-y-6 py-4">
            {/* Match Created Successfully */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <div className="text-lg font-bold text-emerald-400 mb-2">
                  {gameMode === 'quick' ? '⚡ Quick Match Created!' : '🎯 Private Battle Created!'}
                </div>
                <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold">
                  {wager * 2} GORB Prize Pool
                </Badge>
              </div>

              <div className="bg-slate-700/40 border border-slate-600/30 rounded-lg p-4 space-y-2">
                <div className="text-sm text-slate-400">Match ID</div>
                <div className="text-slate-200 font-mono text-sm break-all">
                  {createdMatch.id}
                </div>
              </div>

              {/* Always show the match link */}
              <div className="space-y-3">
                <div className="text-sm text-slate-300">
                  {gameMode === 'private' ? 'Share this link with your opponent:' : 'Match Link:'}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-lg p-3 text-sm text-slate-300 font-mono break-all">
                    {getMatchLink()}
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className="bg-slate-600 hover:bg-slate-500"
                  >
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {gameMode === 'quick' && (
                <div className="text-sm text-slate-400 bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
                  🔍 Searching for opponent... You'll be notified when someone joins!
                </div>
              )}

              {gameMode === 'private' && (
                <div className="text-sm text-slate-400 bg-indigo-900/20 border border-indigo-600/30 rounded-lg p-3">
                  💡 Share the link above with your friend to start the battle!
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleGoToMatch}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Go to Match
              </Button>
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateBattleModal;
