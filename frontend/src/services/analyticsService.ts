// import { mockAnalytics } from '../data/mockAnalytics';
// import { AnalyticsData, AnalyticsPeriod } from '../types';

// /**
//  * FastAPI swap point. Replace the body with:
//  *   const res = await fetch(`${API_BASE_URL}/api/v1/analytics?period=${period}`);
//  *   if (!res.ok) throw new Error(`Analytics request failed (${res.status})`);
//  *   return mapAnalytics(await res.json());
//  * The period query param is already how the UI drives the data.
//  */
// export async function getAnalyticsData(period: AnalyticsPeriod): Promise<AnalyticsData> {
//   await new Promise<void>((r) => setTimeout(r, 400));
//   return mockAnalytics[period];
// }



import { apiGet } from './apiClient';

export interface AnalyticsResponse {
  startDate: string;
  endDate: string;

  kpis: {
    totalRevenue: number;
    totalOrders: number;
    totalProfit: number;
    totalCustomers: number;
  };

  revenueTrend: {
    date: string;
    revenue: number;
  }[];

  ordersSummary: {
    totalOrders: number;
    statusBreakdown: {
      status: string;
      count: number;
    }[];
  };

  topCategory: {
    name: string;
    revenue: number;
    sharePct: number;
    orderCount: number;
    itemsSold: number;
  } | null;

  comparison: {
    revenueChangePct: number | null;
    ordersChangePct: number | null;
    profitChangePct: number | null;
  };
}

export interface AnalyticsFilters {
  start_date: string;
  end_date: string;
}

export async function getAnalytics(
  filters: AnalyticsFilters,
  signal?: AbortSignal
): Promise<AnalyticsResponse> {
  const params = new URLSearchParams({
    start_date: filters.start_date,
    end_date: filters.end_date,
  });

  return apiGet<AnalyticsResponse>(
    `/api/analytics/overview?${params.toString()}`,
    { signal }
  );
}
