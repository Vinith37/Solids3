// ============================================================
// useCalculation — Reusable hook for save/load calculation state
// Encapsulates the repeated load-from-URL and save-via-prompt
// pattern found in every engineering page.
// ============================================================

import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { calculationService } from '../services/api';

interface UseCalculationOptions {
  /** Display name of the calculation type, e.g. "Fatigue" */
  type: string;
  /** Route path for this module, e.g. "/fatigue" */
  module: string;
  /** Returns the current state to persist */
  getState: () => Record<string, unknown>;
  /** Called when a saved state is loaded from the URL */
  onLoad?: (state: Record<string, unknown>) => void;
}

interface UseCalculationReturn {
  /** Triggers the save dialog + API call */
  saveState: () => Promise<void>;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Error message from the last save attempt */
  saveError: string | null;
}

export function useCalculation({
  type,
  module,
  getState,
  onLoad,
}: UseCalculationOptions): UseCalculationReturn {
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load saved state from URL query param (?loadId=xxx)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('loadId');
    if (!id || !onLoad) return;

    calculationService
      .load(id)
      .then((data) => {
        if (data.state) {
          onLoad(data.state as Record<string, unknown>);
        }
      })
      .catch((err) => {
        console.error(`[useCalculation] Failed to load ${type} state:`, err);
      });
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save current state with a user-provided name
  const saveState = useCallback(async () => {
    const defaultName = `${type} Analysis ${new Date().toLocaleTimeString()}`;
    const name = prompt('Name this calculation:', defaultName);
    if (!name) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await calculationService.save({
        name,
        type,
        module,
        state: getState(),
      });
      alert('Archived successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setSaveError(message);
      console.error(`[useCalculation] Save failed for ${type}:`, err);
    } finally {
      setIsSaving(false);
    }
  }, [type, module, getState]);

  return { saveState, isSaving, saveError };
}
