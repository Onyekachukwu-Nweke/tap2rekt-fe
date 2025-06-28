
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Lock, Users } from 'lucide-react';

interface CreateBattleFormProps {
  onSubmit: (wager: number, isPrivate: boolean) => void;
  loading?: boolean;
}

const CreateBattleForm = ({ onSubmit, loading = false }: CreateBattleFormProps) => {
  const [wager, setWager] = useState(0.001);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wager >= 0.001) {
      onSubmit(wager, isPrivate);
    }
  };

  const handleWagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setWager(value);
    }
  };

  const isValidWager = wager >= 0.001;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-amber-400" />
          Create Battle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wager" className="text-slate-200">
              Wager Amount (GORB)
            </Label>
            <Input
              id="wager"
              type="number"
              min="0.001"
              max="1000"
              step="0.001"
              value={wager}
              onChange={handleWagerChange}
              className="bg-slate-700 border-slate-600 text-slate-100"
              placeholder="Enter wager amount (min 0.001)"
            />
            {!isValidWager && (
              <p className="text-red-400 text-sm">Minimum wager is 0.001 GORB</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/40 border border-slate-600/30 rounded-lg">
            <div className="flex items-center space-x-3">
              {isPrivate ? (
                <Lock className="w-5 h-5 text-amber-400" />
              ) : (
                <Users className="w-5 h-5 text-emerald-400" />
              )}
              <div>
                <Label htmlFor="private-toggle" className="text-slate-200 font-medium">
                  {isPrivate ? 'Private Battle' : 'Public Battle'}
                </Label>
                <p className="text-sm text-slate-400">
                  {isPrivate 
                    ? 'Only accessible via direct link' 
                    : 'Visible in active battles list'
                  }
                </p>
              </div>
            </div>
            <Switch
              id="private-toggle"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={loading || !isValidWager}
          >
            {loading ? 'Creating...' : `Create Battle (${wager.toFixed(4)} GORB)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBattleForm;
