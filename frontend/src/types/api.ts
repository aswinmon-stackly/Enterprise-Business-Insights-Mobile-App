/** Wire format of GET /api/dashboard. Mirrors backend/app/schemas/dashboard.py (camelCase JSON). */
export interface KpiMetricDTO { value: number; change: number }

export interface DashboardResponse {
  user: { name: string; role: string };
  unreadNotifications: number;
  kpis: {
    revenue: KpiMetricDTO;
    orders: KpiMetricDTO;
    customers: KpiMetricDTO;
    profit: KpiMetricDTO;
  };
  analytics: {
    revenueTrend: { label: string; value: number }[];
    ordersSummary: {
      totalOrders: number;
      averageOrderValue: number;
      fulfilmentRate: number;
      targetAchieved: number;
    };
    topCategory: { name: string; revenue: number; sharePct: number; change: number };
  };
  recentActivities: {
    id: string;
    type: 'order' | 'target' | 'customer' | 'alert';
    title: string;
    subtitle: string;
    amount: number | null;
    timestamp: string; // ISO-8601 UTC
  }[];
}
