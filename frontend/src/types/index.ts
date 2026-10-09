/** Shapes mirror what the FastAPI backend will return (snake_case mapped in the service layer). */
export type KpiFormat = 'currency' | 'number';
export type KpiId = 'revenue' | 'orders' | 'customers' | 'profit';

export interface Kpi {
  id: KpiId;
  label: string;
  value: number;
  format: KpiFormat;
  changePct: number; // positive = up, negative = down
}

export interface TrendPoint { label: string; value: number }

export interface SalesSummary {
  totalOrders: number;
  avgOrderValue: number;
  fulfilmentRatePct: number;
  targetAchievedPct: number;
}

export interface TopCategory { name: string; revenue: number; sharePct: number; changePct: number }

export type ActivityType = 'order' | 'target' | 'customer' | 'alert';
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  meta: string; // amount or relative time, pre-formatted by the API/service
}

export interface UserProfile { name: string; role: string }

export interface DashboardData {
  user: UserProfile;
  unreadNotifications: number;
  kpis: Kpi[];
  revenueTrend: TrendPoint[];
  salesSummary: SalesSummary;
  topCategory: TopCategory;
  activities: Activity[];
}

/* ---------- Analytics screen ---------- */
export type AnalyticsPeriod = '7D' | '30D' | '90D';

export interface BreakdownItem { id: string; label: string; value: number; sharePct: number }
export interface TopProduct { id: string; name: string; category: string; units: number; revenue: number }

export interface AnalyticsData {
  period: AnalyticsPeriod;
  totalRevenue: number;
  changePct: number; // vs previous period of the same length
  trend: TrendPoint[];
  categories: BreakdownItem[];
  regions: BreakdownItem[];
  topProducts: TopProduct[];
}
