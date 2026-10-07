import { mockAnalytics } from '../data/mockAnalytics';
import { AnalyticsData, AnalyticsPeriod } from '../types';

/**
 * FastAPI swap point. Replace the body with:
 *   const res = await fetch(`${API_BASE_URL}/api/v1/analytics?period=${period}`);
 *   if (!res.ok) throw new Error(`Analytics request failed (${res.status})`);
 *   return mapAnalytics(await res.json());
 * The period query param is already how the UI drives the data.
 */
export async function getAnalyticsData(period: AnalyticsPeriod): Promise<AnalyticsData> {
  await new Promise<void>((r) => setTimeout(r, 400));
  return mockAnalytics[period];
}
