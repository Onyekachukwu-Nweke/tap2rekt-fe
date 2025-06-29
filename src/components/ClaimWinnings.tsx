
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Coins, CheckCircle, AlertTriangle } from 'lucide-react';
import { useClaimWinnings } from '@/hooks/useClaimWinnings';

interface ClaimWinningsProps {
  matchId: string;
  onClaimSuccess?: () => void;
}

const ClaimWinnings = ({ matchId, onClaimSuccess }: ClaimWinningsProps) => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { claimWinnings, checkClaimEligibility, claiming } = useClaimWinnings();

  // Check eligibility only once on mount
  useEffect(() => {
    let mounted = true;
    
    const checkEligibility = async () => {
      try {
        const result = await checkClaimEligibility(matchId);
        if (mounted) {
          setEligibility(result);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to check claim eligibility:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkEligibility();
    
    return () => {
      mounted = false;
    };
  }, [matchId, checkClaimEligibility]);

  const handleClaim = async () => {
    try {
      const result = await claimWinnings(matchId);
      
      if (result.success) {
        // Update eligibility to show claimed state
        setEligibility({
          canClaim: false,
          reason: 'Winnings already claimed',
          alreadyClaimed: true
        });
        
        if (onClaimSuccess) {
          onClaimSuccess();
        }
      }
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <div className="text-slate-400">Checking claim eligibility...</div>
        </CardContent>
      </Card>
    );
  }

  if (!eligibility) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <div className="text-red-400">Unable to check claim eligibility</div>
        </CardContent>
      </Card>
    );
  }

  // Already claimed state
  if (eligibility.alreadyClaimed) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-emerald-600/50">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-emerald-300">Winnings Claimed!</h3>
            <p className="text-emerald-200">Your winnings have been successfully claimed</p>
          </div>
          <Badge className="bg-emerald-600 text-white">
            <Trophy className="w-4 h-4 mr-2" />
            Completed
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // Cannot claim state
  if (!eligibility.canClaim) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <div className="text-slate-400">{eligibility.reason}</div>
        </CardContent>
      </Card>
    );
  }

  // Can claim state
  return (
    <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-600/50">
      <CardContent className="p-6 text-center space-y-6">
        <div className="flex items-center justify-center">
          <Trophy className="w-16 h-16 text-amber-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-amber-300">🎉 Victory!</h3>
          <p className="text-amber-200">Congratulations! You won the battle</p>
        </div>

        <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <span className="text-2xl font-bold text-amber-300">{eligibility.winningsAmount} GOR</span>
          </div>
          <div className="text-amber-200 text-sm">Total Winnings Available</div>
        </div>

        <Button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 text-lg"
        >
          {claiming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Claiming Winnings...
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5 mr-2" />
              Claim Winnings
            </>
          )}
        </Button>

        <div className="text-xs text-amber-300/70">
          Winnings will be transferred to your connected wallet
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimWinnings;
