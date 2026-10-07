import { DashboardData } from '../types';

export const mockDashboard: DashboardData = {
  user: { name: 'Arjun Nair', role: 'Regional Sales Head' },
  unreadNotifications: 3,
  kpis: [
    { id: 'revenue', label: 'Revenue', value: 12840000, format: 'currency', changePct: 12.4 },
    { id: 'orders', label: 'Orders', value: 3482, format: 'number', changePct: 8.1 },
    { id: 'customers', label: 'Customers', value: 1256, format: 'number', changePct: -2.3 },
    { id: 'profit', label: 'Profit', value: 2410000, format: 'currency', changePct: 5.7 },
  ],
  revenueTrend: [
    { label: 'Mon', value: 1.42 }, { label: 'Tue', value: 1.68 }, { label: 'Wed', value: 1.55 },
    { label: 'Thu', value: 1.97 }, { label: 'Fri', value: 2.21 }, { label: 'Sat', value: 2.04 },
    { label: 'Sun', value: 2.43 },
  ],
  salesSummary: { totalOrders: 3482, avgOrderValue: 3687, fulfilmentRatePct: 96.2, targetAchievedPct: 87 },
  topCategory: { name: 'Consumer Electronics', revenue: 4210000, sharePct: 32.8, changePct: 14.2 },
  activities: [
    { id: '1', type: 'order', title: 'New order received', subtitle: 'Order #ORD1024', meta: '₹24,500' },
    { id: '2', type: 'target', title: 'Sales target updated', subtitle: 'North Region', meta: '2 hours ago' },
    { id: '3', type: 'customer', title: 'New enterprise customer', subtitle: 'Kaveri Textiles Pvt Ltd', meta: '5 hours ago' },
    { id: '4', type: 'alert', title: 'Low stock warning', subtitle: 'SKU EL-2291 · Chennai warehouse', meta: 'Yesterday' },
    { id: '5', type: 'order', title: 'Bulk order confirmed', subtitle: 'Order #ORD1019', meta: '₹1,82,000' },
  ],
};
