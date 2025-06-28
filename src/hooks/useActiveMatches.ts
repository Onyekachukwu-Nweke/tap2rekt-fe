
import { useState, useEffect, useCallback } from 'react';
import { useMatches } from './useMatches';

export const useActiveMatches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getActiveMatches } = useMatches();

  // Use a ref to prevent multiple simultaneous calls
  const [isLoadingRef, setIsLoadingRef] = useState(false);

  const loadMatches = useCallback(async () => {
    if (isLoadingRef) return; // Prevent multiple simultaneous calls
    
    setIsLoadingRef(true);
    setError(null);
    
    try {
      const activeMatches = await getActiveMatches();
      setMatches(activeMatches || []);
    } catch (err) {
      console.error('Failed to load active matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
      setIsLoadingRef(false);
    }
  }, [getActiveMatches, isLoadingRef]);

  useEffect(() => {
    loadMatches();
  }, []); // Remove getActiveMatches from dependencies to prevent infinite loop

  return {
    matches,
    loading,
    error,
    refetch: loadMatches
  };
};
