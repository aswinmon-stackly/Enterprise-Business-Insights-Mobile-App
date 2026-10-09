import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/apiClient';
import { getDashboardData } from '../services/dashboardService';
import { DashboardData } from '../types';

type LoadMode = 'initial' | 'refresh' | 'retry';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);       // first load / retry (full-screen state)
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh (keeps content visible)
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async (mode: LoadMode) => {
    inFlight.current?.abort(); // a newer request supersedes the old one
    const controller = new AbortController();
    inFlight.current = controller;
    if (mode === 'refresh') setRefreshing(true); else setLoading(true);
    try {
      const next = await getDashboardData(controller.signal);
      if (controller.signal.aborted) return;
      setData(next);
      setError(null);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(getErrorMessage(e));
    } finally {
      if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useEffect(() => {
    void load('initial');
    return () => inFlight.current?.abort();
  }, [load]);

  // Returning the promise keeps the RefreshControl spinner visible until the request completes.
  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => load('retry'), [load]);
  return { data, loading, refreshing, error, refresh, retry };
}
