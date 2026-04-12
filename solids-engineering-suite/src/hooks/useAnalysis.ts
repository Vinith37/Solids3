// ============================================================
// useAnalysis — Reusable hook for auto-computing on input change
// Wraps the "POST inputs → backend → setResults" pattern
// with debouncing, loading state, AbortController for
// cancellation, and rate-limit-specific error messaging.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { RateLimitError } from '../services/api';

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
  analyzeFn: (input: TInput, signal?: AbortSignal) => Promise<TResult>,
  input: TInput,
  debounceMs = 150,
): {
  result: TResult | null;
  isLoading: boolean;
  error: string | null;
  isRateLimited: boolean;
} {
  const [result, setResult] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Track the latest AbortController to cancel stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request from a previous input change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);

      try {
        const data = await analyzeFn(input, controller.signal);

        // Only apply if this request wasn't aborted
        if (!controller.signal.aborted) {
          setResult(data);
        }
      } catch (err) {
        // Ignore aborted requests (user changed input)
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        if (!controller.signal.aborted) {
          if (err instanceof RateLimitError) {
            setIsRateLimited(true);
            setError(`Too many requests. Please wait ${err.retryAfterSeconds}s and try again.`);
          } else {
            const message =
              err instanceof Error ? err.message : 'Analysis computation failed';
            setError(message);
          }
          console.error('[useAnalysis] Computation error:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [JSON.stringify(input)]); // eslint-disable-line react-hooks/exhaustive-deps

  return { result, isLoading, error, isRateLimited };
}
