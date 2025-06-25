
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Timer, Target, Trophy } from 'lucide-react';

interface LightningReflexGameProps {
  onGameComplete: (score: number, won: boolean) => void;
}

const LightningReflexGame = ({ onGameComplete }: LightningReflexGameProps) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'active' | 'clicked' | 'finished'>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [averageScore, setAverageScore] = useState(0);
  const [bestRound, setBestRound] = useState(0);

  const totalRounds = 5;

  const startNewRound = useCallback(() => {
    if (currentRound >= totalRounds) {
      setGameState('finished');
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      setAverageScore(avg);
      onGameComplete(avg, avg < 300); // Win if average is under 300ms
      return;
    }

    setGameState('ready');
    
    // Random delay between 1-4 seconds
    const delay = Math.random() * 3000 + 1000;
    
    const timeout = setTimeout(() => {
      setGameState('active');
      setStartTime(Date.now());
    }, delay);
    
    setTimeoutId(timeout);
  }, [currentRound, scores, onGameComplete]);

  const handleClick = () => {
    if (gameState === 'active') {
      const reactionTime = Date.now() - startTime;
      const newScores = [...scores, reactionTime];
      setScores(newScores);
      setGameState('clicked');
      
      if (reactionTime < bestRound || bestRound === 0) {
        setBestRound(reactionTime);
      }
      
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        startNewRound();
      }, 1500);
    } else if (gameState === 'ready') {
      // Too early - penalty
      if (timeoutId) clearTimeout(timeoutId);
      setGameState('waiting');
      const penaltyScore = 999;
      const newScores = [...scores, penaltyScore];
      setScores(newScores);
      
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        startNewRound();
      }, 1500);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setCurrentRound(0);
    setScores([]);
    setStartTime(0);
    setAverageScore(0);
    setBestRound(0);
    if (timeoutId) clearTimeout(timeoutId);
  };

  const getStateDisplay = () => {
    switch (gameState) {
      case 'waiting':
        return {
          title: 'Get Ready!',
          subtitle: 'Click "Start Round" to begin',
          bgColor: 'bg-slate-800',
          textColor: 'text-white'
        };
      case 'ready':
        return {
          title: 'Wait for it...',
          subtitle: 'Don\'t click yet!',
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        };
      case 'active':
        return {
          title: 'CLICK NOW!',
          subtitle: 'React as fast as you can!',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'clicked':
        const lastScore = scores[scores.length - 1];
        return {
          title: `${lastScore}ms`,
          subtitle: lastScore < 300 ? 'Excellent!' : lastScore < 500 ? 'Good!' : 'Try faster!',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
      case 'finished':
        return {
          title: 'Game Complete!',
          subtitle: `Average: ${Math.round(averageScore)}ms`,
          bgColor: 'bg-purple-500',
          textColor: 'text-white'
        };
    }
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="space-y-6">
      {/* Game Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Lightning Reflexes Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-purple-300">{currentRound}/{totalRounds}</div>
              <div className="text-sm text-purple-400">Round</div>
            </div>
            <div>
              <div className="text-xl font-bold text-cyan-300">
                {bestRound > 0 ? `${bestRound}ms` : '-'}
              </div>
              <div className="text-sm text-cyan-400">Best Time</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-300">
                {scores.length > 0 ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}ms` : '-'}
              </div>
              <div className="text-sm text-green-400">Average</div>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-300">
                {gameState === 'finished' ? (averageScore < 300 ? '50' : '10') : '?'} GORB
              </div>
              <div className="text-sm text-yellow-400">Reward</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div 
            className={`${stateDisplay.bgColor} ${stateDisplay.textColor} min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 rounded-lg`}
            onClick={handleClick}
          >
            <div className="text-6xl font-bold mb-4">{stateDisplay.title}</div>
            <div className="text-xl">{stateDisplay.subtitle}</div>
            
            {gameState === 'ready' && (
              <div className="mt-4 text-sm opacity-75">
                Click too early and you'll get a penalty!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {gameState === 'waiting' && currentRound < totalRounds && (
          <Button 
            onClick={startNewRound}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Timer className="w-4 h-4 mr-2" />
            Start Round {currentRound + 1}
          </Button>
        )}
        
        {gameState === 'finished' && (
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        )}
      </div>

      {/* Round History */}
      {scores.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Round History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scores.map((score, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className={`
                    ${score === 999 ? 'border-red-500 text-red-400' : 
                      score < 300 ? 'border-green-500 text-green-400' : 
                      score < 500 ? 'border-yellow-500 text-yellow-400' : 
                      'border-slate-500 text-slate-400'}
                  `}
                >
                  Round {index + 1}: {score === 999 ? 'Too Early!' : `${score}ms`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LightningReflexGame;
