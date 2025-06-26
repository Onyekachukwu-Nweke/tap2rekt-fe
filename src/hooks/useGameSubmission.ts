
import { useState, useCallback } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';

export const useGameSubmission = (matchId: string, walletAddress: string) => {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const { submitTapResult } = useMatches();
  const { toast } = useToast();

  const submitScore = useCallback(async (score: number) => {
    if (hasSubmittedScore || submissionStatus !== 'idle') {
      console.warn('Score already submitted or submission in progress');
      return;
    }

    setSubmissionStatus('submitting');
    setHasSubmittedScore(true);

    // Create unique signature with timestamp and random component
    const timestamp = Date.now();
    const randomComponent = Math.random().toString(36).substring(2, 15);
    const message = `match:${matchId},score:${score},timestamp:${timestamp},random:${randomComponent}`;
    const signature = btoa(message);

    try {
      console.log('Submitting final score:', score);
      await submitTapResult(matchId, walletAddress, score, signature);
      setSubmissionStatus('submitted');
      
      toast({
        title: "✅ Score Submitted!",
        description: `Your score of ${score} taps has been recorded`,
      });
      
    } catch (error) {
      console.error('Failed to submit result:', error);
      setSubmissionStatus('failed');
      setHasSubmittedScore(false); // Allow retry
      
      toast({
        title: "❌ Submission Failed",
        description: "Failed to submit your score. Please try again.",
        variant: "destructive"
      });
    }
  }, [matchId, walletAddress, hasSubmittedScore, submissionStatus, submitTapResult, toast]);

  const retrySubmission = useCallback(() => {
    if (hasSubmittedScore) {
      console.warn('Score already submitted, cannot retry');
      return;
    }
    setSubmissionStatus('idle');
  }, [hasSubmittedScore]);

  return {
    submissionStatus,
    hasSubmittedScore,
    submitScore,
    retrySubmission
  };
};
