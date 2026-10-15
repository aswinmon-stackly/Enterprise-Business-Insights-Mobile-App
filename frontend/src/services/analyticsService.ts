import { AnalyticsFilter, AnalyticsOverview } from '../types/analytics';
import { apiGet } from './apiClient';

/** Presets are resolved by the backend (in its business time zone); custom ranges send explicit dates. */
export function buildOverviewQuery(filter: AnalyticsFilter): string {
  const params: Record<string, string> =
    filter.kind === 'preset'
      ? { period: filter.period }
      : { period: 'custom', start_date: filter.startDate, end_date: filter.endDate };
  return Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}

/** GET /api/analytics/overview -> typed response. The comparison (previous period) is computed by the backend. */
export function getAnalyticsOverview(filter: AnalyticsFilter, signal?: AbortSignal): Promise<AnalyticsOverview> {
  return apiGet<AnalyticsOverview>(`/api/analytics/overview?${buildOverviewQuery(filter)}`, { signal });
}
