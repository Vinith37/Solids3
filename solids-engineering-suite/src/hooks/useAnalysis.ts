// ============================================================
// useAnalysis — Reusable hook for auto-computing on input change
// Wraps the "POST inputs → backend → setResults" pattern
// with debouncing, loading state, and error handling.
// ============================================================

import { useState, useEffect, useRef } from 'react';

/**
 * Generic hook that automatically calls an analysis service
 * whenever the input changes, with a small debounce to avoid
 * flooding the backend with requests on every keystroke.
 *
 * @param analyzeFn - The typed service method, e.g. `fatigueService.analyze`
 * @param input     - The current input state (re-triggers analysis on change)
 * @param debounceMs - Debounce delay in ms (default 150)
 */
export function useAnalysis<TInput, TResult>(
  analyzeFn: (input: TInput) => Promise<TResult>,
  input: TInput,
  debounceMs = 150,
): {
  result: TResult | null;
  isLoading: boolean;
  error: string | null;
} {
  const [result, setResult] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the latest request to avoid stale data from out-of-order responses
  const requestIdRef = useRef(0);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await analyzeFn(input);

        // Only apply if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setResult(data);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          const message =
            err instanceof Error ? err.message : 'Analysis computation failed';
          setError(message);
          console.error('[useAnalysis] Computation error:', err);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [JSON.stringify(input)]); // eslint-disable-line react-hooks/exhaustive-deps

  return { result, isLoading, error };
}
