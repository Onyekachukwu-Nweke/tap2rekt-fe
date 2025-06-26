
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Timer, Zap, Trophy, Users, ArrowLeft } from 'lucide-react';
import { useWebSocketBattle } from '@/hooks/useWebSocketBattle';

interface WebSocketBattleGameProps {
  matchId: string;
  walletAddress: string;
  match: any;
  onBack?: () => void;
}

const WebSocketBattleGame = ({ matchId, walletAddress, match, onBack }: WebSocketBattleGameProps) => {
  const { isConnected, battleState, sendTap } = useWebSocketBattle(matchId, walletAddress);

  const getGameStateDisplay = () => {
    switch (battleState.gameState) {
      case 'waiting':
        return {
          title: '⏳ Waiting for Players',
          subtitle: `${battleState.playerCount}/2 players connected`,
          bgColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
          textColor: 'text-white'
        };
      case 'countdown':
        return {
          title: battleState.countdownTime.toString(),
          subtitle: 'Get ready to tap!',
          bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
          textColor: 'text-white'
        };
      case 'active':
        return {
          title: 'TAP!',
          subtitle: `${battleState.gameTime}s remaining`,
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          textColor: 'text-white'
        };
      case 'finished':
        const myScore = battleState.playerTaps[walletAddress] || 0;
        const isWinner = battleState.winner === walletAddress;
        return {
          title: isWinner ? '🎉 Victory!' : '💀 Defeat',
          subtitle: `Your score: ${myScore} taps`,
          bgColor: isWinner 
            ? 'bg-gradient-to-br from-emerald-500 to-green-600'
            : 'bg-gradient-to-br from-red-500 to-pink-600',
          textColor: 'text-white'
        };
    }
  };

  const stateDisplay = getGameStateDisplay();
  const myTaps = battleState.playerTaps[walletAddress] || 0;
  
  // Get opponent's taps
  const opponentWallet = Object.keys(battleState.playerTaps).find(wallet => wallet !== walletAddress);
  const opponentTaps = opponentWallet ? battleState.playerTaps[opponentWallet] || 0 : 0;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-slate-300 text-sm">
                {isConnected ? '🔗 Connected' : '❌ Disconnected'}
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              Players: {battleState.playerCount}/2
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              WebSocket Battle - LIVE
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg px-4 py-2">
              {match.wager * 2} GORB Prize
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Your Stats */}
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-bold text-purple-300">You</div>
              <div className="text-3xl font-bold text-white">{myTaps}</div>
              <div className="text-sm text-slate-400">Taps</div>
            </div>
            
            {/* Opponent Stats */}
            <div className="text-center bg-slate-700/40 border border-slate-600/30 rounded-lg p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-bold text-red-300">
                {opponentWallet ? `${opponentWallet.slice(0, 8)}...${opponentWallet.slice(-4)}` : 'Opponent'}
              </div>
              <div className="text-3xl font-bold text-white">{opponentTaps}</div>
              <div className="text-sm text-slate-400">Taps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div 
            className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg relative overflow-hidden`}
            onClick={sendTap}
          >
            {/* Tap Effects */}
            {battleState.gameState === 'active' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            <div className="text-6xl font-bold mb-4">{stateDisplay.title}</div>
            <div className="text-xl mb-4">{stateDisplay.subtitle}</div>
            
            {battleState.gameState === 'active' && (
              <div className="flex items-center space-x-4 text-lg">
                <Timer className="w-5 h-5" />
                <span>Time: {battleState.gameTime}s</span>
                <Zap className="w-5 h-5 ml-6" />
                <span>Taps: {myTaps}</span>
              </div>
            )}

            {battleState.gameState === 'finished' && battleState.scores && (
              <div className="text-lg mt-4 bg-white/20 rounded-lg px-6 py-3">
                <div className="mb-2">Final Scores:</div>
                {battleState.scores.map((score) => (
                  <div key={score.wallet} className="flex justify-between items-center">
                    <span>{score.wallet === walletAddress ? 'You' : `${score.wallet.slice(0, 8)}...`}</span>
                    <span className="font-bold">{score.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      {onBack && (
        <div className="flex justify-center">
          <Button 
            onClick={onBack}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebSocketBattleGame;
