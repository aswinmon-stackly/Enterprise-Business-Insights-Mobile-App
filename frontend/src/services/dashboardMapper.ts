import { DashboardResponse } from '../types/api';
import { DashboardData, KpiFormat, KpiId } from '../types';
import { formatRelativeTime, formatRupees } from '../utils/format';

const KPI_DISPLAY: { id: KpiId; label: string; format: KpiFormat }[] = [
  { id: 'revenue', label: 'Revenue', format: 'currency' },
  { id: 'orders', label: 'Orders', format: 'number' },
  { id: 'customers', label: 'Customers', format: 'number' },
  { id: 'profit', label: 'Profit', format: 'currency' },
];

/**
 * API wire format -> UI model. Components depend on DashboardData only, so backend
 * contract changes are absorbed here instead of rippling through the UI.
 */
export function mapDashboard(r: DashboardResponse, now: number = Date.now()): DashboardData {
  const { ordersSummary: s, topCategory: c } = r.analytics;
  return {
    user: r.user,
    unreadNotifications: r.unreadNotifications,
    kpis: KPI_DISPLAY.map(({ id, label, format }) => ({
      id, label, format, value: r.kpis[id].value, changePct: r.kpis[id].change,
    })),
    revenueTrend: r.analytics.revenueTrend,
    salesSummary: {
      totalOrders: s.totalOrders,
      avgOrderValue: s.averageOrderValue,
      fulfilmentRatePct: s.fulfilmentRate,
      targetAchievedPct: s.targetAchieved,
    },
    topCategory: { name: c.name, revenue: c.revenue, sharePct: c.sharePct, changePct: c.change },
    activities: r.recentActivities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      subtitle: a.subtitle,
      meta: a.amount !== null ? formatRupees(a.amount) : formatRelativeTime(a.timestamp, now),
    })),
  };
}
