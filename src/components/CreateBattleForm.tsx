
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Coins, Target } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';

interface CreateBattleFormProps {
  walletAddress: string;
  onBattleCreated?: (matchId: string) => void;
}

const CreateBattleForm = ({ walletAddress, onBattleCreated }: CreateBattleFormProps) => {
  const [wager, setWager] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const { createMatch } = useMatches();

  const handleCreateBattle = async () => {
    if (!walletAddress) {
      return;
    }

    setIsCreating(true);
    try {
      const match = await createMatch(walletAddress, wager);
      if (match && onBattleCreated) {
        onBattleCreated(match.id);
      }
    } catch (error) {
      console.error('Failed to create battle:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-800/90 to-purple-900/90 border-purple-500/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-100 flex items-center">
          <Target className="w-6 h-6 mr-3 text-purple-400" />
          Create New Battle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          {isCreating ? 'Creating Battle...' : `🎮 Create Battle (${wager} GORB)`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateBattleForm;
