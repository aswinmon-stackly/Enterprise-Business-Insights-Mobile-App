/** Wire format of GET /api/analytics/overview (mirrors backend/app/schemas/analytics.py, camelCase JSON). */
export type PresetPeriod = 'today' | 'last_7_days' | 'last_30_days' | 'this_month';

/** What the user selected. Presets are resolved by the backend; custom dates are plain calendar dates (YYYY-MM-DD). */
export type AnalyticsFilter =
  | { kind: 'preset'; period: PresetPeriod }
  | { kind: 'custom'; startDate: string; endDate: string };

export type ChangeDirection = 'up' | 'down' | 'flat' | 'new' | 'none';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface MetricComparison {
  value: number;
  previous: number | null;
  changePct: number | null; // null when previous is 0 (or no comparison): never Infinity
  direction: ChangeDirection;
}

export interface AnalyticsOverview {
  period: { preset: PresetPeriod | 'custom'; startDate: string; endDate: string; days: number; timezone: string };
  comparison: { type: 'previous_period' | 'previous_year'; startDate: string; endDate: string } | null;
  isEmpty: boolean;
  metrics: { revenue: MetricComparison; orders: MetricComparison; profit: MetricComparison; customers: MetricComparison };
  revenueTrend: { date: string; revenue: number }[];
  orderStatusBreakdown: { status: OrderStatus; count: number; sharePct: number }[];
  topCategory: { name: string; revenue: number; orders: number; unitsSold: number; sharePct: number } | null;
  performance: {
    averageOrderValue: number;
    profitMarginPct: number;
    completionRatePct: number;
    cancellationRatePct: number;
    averageDailyRevenue: number;
    bestDay: { date: string; revenue: number } | null;
  };
}
