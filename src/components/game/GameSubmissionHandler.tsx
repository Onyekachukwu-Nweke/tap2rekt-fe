
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GameSubmissionHandlerProps {
  submissionStatus: 'idle' | 'submitting' | 'submitted' | 'failed';
  myScore: number;
  opponentScore: number;
  winner?: string;
  walletAddress: string;
  onRetrySubmission: () => void;
}

export const GameSubmissionHandler = ({
  submissionStatus,
  myScore,
  opponentScore,
  winner,
  walletAddress,
  onRetrySubmission
}: GameSubmissionHandlerProps) => {
  if (!winner && submissionStatus !== 'idle') {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          {submissionStatus === 'submitting' && (
            <div className="text-white">⏳ Submitting your score...</div>
          )}
          {submissionStatus === 'failed' && (
            <div className="text-white">
              <div className="mb-2">⚠️ Submission failed. Try again?</div>
              <Button 
                onClick={onRetrySubmission}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                Retry Submission
              </Button>
            </div>
          )}
          {submissionStatus === 'submitted' && (
            <div className="text-white">✅ Score submitted successfully!</div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (winner) {
    const isWinner = winner === walletAddress;
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="text-white mb-2">Battle Complete!</div>
          <div className="text-white">Winner: {isWinner ? 'YOU!' : `${winner.slice(0, 8)}...`}</div>
          <div className="text-sm text-slate-300 mt-2">
            Final Score: {myScore} vs {opponentScore}
          </div>
          {isWinner && (
            <div className="text-sm text-emerald-200 mt-2">
              You won the battle! 💰
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
