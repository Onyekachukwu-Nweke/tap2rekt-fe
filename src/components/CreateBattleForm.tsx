
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
  const [wager, setWager] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(wager, isPrivate);
  };

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
              Wager Amount (GOR)
            </Label>
            <Input
              id="wager"
              type="number"
              min="1"
              max="1000"
              value={wager}
              onChange={(e) => setWager(Number(e.target.value))}
              className="bg-slate-700 border-slate-600 text-slate-100"
            />
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
            disabled={loading}
          >
            {loading ? 'Creating...' : `Create Battle (${wager} GOR)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBattleForm;
