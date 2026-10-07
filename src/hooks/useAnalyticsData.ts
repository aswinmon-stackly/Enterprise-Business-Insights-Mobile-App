import { useCallback, useEffect, useState } from 'react';
import { getAnalyticsData } from '../services/analyticsService';
import { AnalyticsData, AnalyticsPeriod } from '../types';

/** Refetches whenever `period` changes; keeps the previous data on screen while loading the next. */
export function useAnalyticsData(period: AnalyticsPeriod) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      setData(await getAnalyticsData(period));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { void load(); }, [load]);
  return { data, loading, refreshing, error, refresh: () => load(true) };
}
