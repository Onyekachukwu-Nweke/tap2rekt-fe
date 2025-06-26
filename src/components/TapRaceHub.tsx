import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Zap, Trophy, Timer, Coins, Play, Crown, Sparkles } from 'lucide-react';
import CreateBattleForm from './CreateBattleForm';
import CreateBattleModal from './CreateBattleModal';
import ActiveMatches from './ActiveMatches';
import { useState } from 'react';
import { useWalletAddress } from '@/hooks/useWalletAddress';

interface TapRaceHubProps {
  onCreateMatch: () => void;
  onJoinMatch: () => void;
  onViewLeaderboard: () => void;
  playerStats: {
    gamesPlayed: number;
    bestScore: number;
    totalWins: number;
    totalEarnings: number;
  };
}

const TapRaceHub = ({ onCreateMatch, onJoinMatch, onViewLeaderboard, playerStats }: TapRaceHubProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { walletAddress } = useWalletAddress();

  const handleBattleCreated = (matchId: string) => {
    console.log('Battle created with ID:', matchId);
    setShowCreateModal(false);
    onCreateMatch();
  };

  const handleJoinMatch = (matchId: string) => {
    console.log('Joining match:', matchId);
    onJoinMatch();
  };

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="w-80 h-80 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-100 via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-4">
            🎯 Tap 2 Rekt 🎯
          </h2>
          <div className="flex justify-center space-x-4 mb-6">
            <Target className="w-6 h-6 text-purple-400" />
            <Zap className="w-6 h-6 text-amber-400" />
            <Crown className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto font-medium leading-relaxed">
            Challenge opponents in lightning-fast 1v1 tapping battles! 
            Create matches, stake GORB tokens, and prove you're the fastest tapper on Gorbagana! 🚀
          </p>
        </div>
      </div>

      {/* Player Stats */}
      <Card className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl shadow-slate-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5"></div>
        <CardHeader className="relative">
          <CardTitle className="text-2xl text-slate-200 flex items-center">
            <Trophy className="w-7 h-7 mr-3 text-amber-400" />
            Your Battle Stats
            <Sparkles className="w-5 h-5 ml-3 text-purple-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-300">{playerStats.gamesPlayed}</div>
              <div className="text-sm text-slate-400 font-semibold">Battles Fought</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-amber-300">{playerStats.totalWins}</div>
              <div className="text-sm text-slate-400 font-semibold">Victories 🏆</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-indigo-300">{playerStats.bestScore}</div>
              <div className="text-sm text-slate-400 font-semibold">Best Taps ⚡</div>
            </div>
            <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-emerald-300">{playerStats.totalEarnings}</div>
              <div className="text-sm text-slate-400 font-semibold">GORB Earned 💰</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Match */}
        <Card className="bg-gradient-to-br from-purple-800/90 to-purple-900/90 border-purple-500/40 hover:border-purple-400/80 transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 group-hover:from-purple-600/20 group-hover:to-indigo-600/20 transition-all duration-300"></div>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                Host Battle
              </Badge>
            </div>
            <CardTitle className="text-xl text-slate-100 font-bold">Create Match</CardTitle>
            <CardDescription className="text-slate-300 leading-relaxed">
              Start a new tapping battle and wait for challengers to join your match!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-slate-300 bg-slate-700/40 border border-slate-600/30 rounded-lg p-2">
                <Coins className="w-4 h-4 mr-2 text-amber-400" />
                Set Wager
              </div>
              <div className="flex items-center text-slate-300 bg-slate-700/40 border border-slate-600/30 rounded-lg p-2">
                <Timer className="w-4 h-4 mr-2 text-indigo-400" />
                10 seconds
              </div>
            </div>
            
            <Button 
              className="w-full text-lg font-bold py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.02] transition-all duration-300"
              onClick={() => setShowCreateModal(true)}
            >
              <Play className="w-5 h-5 mr-3" />
              🎮 CREATE BATTLE!
            </Button>
          </CardContent>
        </Card>

        {/* Join Match */}
        <Card className="bg-gradient-to-br from-amber-800/90 to-orange-900/90 border-amber-500/40 hover:border-amber-400/80 transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10 group-hover:from-amber-600/20 group-hover:to-orange-600/20 transition-all duration-300"></div>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                Join Battle
              </Badge>
            </div>
            <CardTitle className="text-xl text-slate-100 font-bold">Quick Match</CardTitle>
            <CardDescription className="text-slate-300 leading-relaxed">
              Jump into existing battles and challenge other players instantly!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-slate-300 bg-slate-700/40 border border-slate-600/30 rounded-lg p-2">
                <Zap className="w-4 h-4 mr-2 text-purple-400" />
                Instant Join
              </div>
              <div className="flex items-center text-slate-300 bg-slate-700/40 border border-slate-600/30 rounded-lg p-2">
                <Trophy className="w-4 h-4 mr-2 text-amber-400" />
                Winner Takes All
              </div>
            </div>
            
            <Button 
              className="w-full text-lg font-bold py-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl hover:shadow-amber-500/30 transform hover:scale-[1.02] transition-all duration-300"
              onClick={onJoinMatch}
            >
              <Zap className="w-5 h-5 mr-3" />
              ⚡ QUICK MATCH!
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create Battle Modal */}
      <CreateBattleModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBattleCreated={handleBattleCreated}
      />

      {/* Active Matches */}
      <ActiveMatches 
        walletAddress={walletAddress || ''}
        onJoinMatch={handleJoinMatch}
      />

      {/* Leaderboard Preview */}
      <div className="text-center bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-600/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-slate-900/50">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-purple-200 bg-clip-text text-transparent mb-4">
          🏆 Prove Your Speed! 🏆
        </h3>
        <p className="text-xl text-slate-300 mb-6">
          Climb the leaderboard and become the fastest tapper on Gorbagana!
        </p>
        <Button 
          onClick={onViewLeaderboard}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg font-bold px-8 py-4"
        >
          <Trophy className="w-5 h-5 mr-2" />
          View Leaderboard
        </Button>
      </div>
    </div>
  );
};

export default TapRaceHub;
