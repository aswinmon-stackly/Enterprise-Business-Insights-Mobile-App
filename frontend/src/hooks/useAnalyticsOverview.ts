import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/apiClient';
import { getAnalyticsOverview } from '../services/analyticsService';
import { AnalyticsFilter, AnalyticsOverview } from '../types/analytics';
import { filterKey } from '../utils/analyticsFilter';

type LoadMode = 'filter' | 'refresh' | 'retry';

/**
 * Loads analytics for a filter.
 * - Refetches only when the filter's identity (filterKey) changes: re-selecting the same filter is a no-op.
 * - A newer request aborts the older one and late responses are ignored, so a slow response can never overwrite a newer selection.
 * - While a new filter loads, the previous result stays on screen (`loading && data`). If loading a *different* filter
 *   fails, the previous result is dropped: it belongs to another period and must not be shown as if it matched.
 *   If a pull-to-refresh of the same filter fails, the data stays and the error is shown as a banner.
 */
export function useAnalyticsOverview(filter: AnalyticsFilter) {
  const key = filterKey(filter);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const loadedKey = useRef<string | null>(null);

  const load = useCallback(async (mode: LoadMode) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    const requestKey = filterKey(filterRef.current);
    if (mode === 'refresh') setRefreshing(true); else setLoading(true);
    try {
      const next = await getAnalyticsOverview(filterRef.current, controller.signal);
      if (controller.signal.aborted) return;
      loadedKey.current = requestKey;
      setData(next);
      setError(null);
    } catch (e) {
      if (controller.signal.aborted) return;
      if (loadedKey.current !== requestKey) setData(null);
      setError(getErrorMessage(e));
    } finally {
      if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useEffect(() => {
    void load('filter');
    return () => inFlight.current?.abort();
  }, [key, load]);

  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => load('retry'), [load]);
  return { data, loading, refreshing, error, refresh, retry };
}
