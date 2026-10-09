import { AnalyticsData, AnalyticsPeriod } from '../types';

const categories7 = [
  { id: 'elec', label: 'Consumer Electronics', value: 4210000, sharePct: 32.8 },
  { id: 'appl', label: 'Home Appliances', value: 3120000, sharePct: 24.3 },
  { id: 'fash', label: 'Fashion & Textiles', value: 2480000, sharePct: 19.3 },
  { id: 'groc', label: 'Grocery & FMCG', value: 1760000, sharePct: 13.7 },
  { id: 'misc', label: 'Others', value: 1270000, sharePct: 9.9 },
];
const regions7 = [
  { id: 'south', label: 'South', value: 4890000, sharePct: 38.1 },
  { id: 'north', label: 'North', value: 3510000, sharePct: 27.3 },
  { id: 'west', label: 'West', value: 2930000, sharePct: 22.8 },
  { id: 'east', label: 'East', value: 1510000, sharePct: 11.8 },
];
const products = [
  { id: 'p1', name: 'Smart LED TV 43"', category: 'Consumer Electronics', units: 412, revenue: 1854000 },
  { id: 'p2', name: 'Inverter AC 1.5 Ton', category: 'Home Appliances', units: 188, revenue: 1410000 },
  { id: 'p3', name: 'Wireless Earbuds Pro', category: 'Consumer Electronics', units: 960, revenue: 1152000 },
  { id: 'p4', name: 'Cotton Kurta Set', category: 'Fashion & Textiles', units: 1340, revenue: 804000 },
];

export const mockAnalytics: Record<AnalyticsPeriod, AnalyticsData> = {
  '7D': {
    period: '7D', totalRevenue: 12840000, changePct: 12.4,
    trend: [
      { label: 'Mon', value: 1.42 }, { label: 'Tue', value: 1.68 }, { label: 'Wed', value: 1.55 },
      { label: 'Thu', value: 1.97 }, { label: 'Fri', value: 2.21 }, { label: 'Sat', value: 2.04 }, { label: 'Sun', value: 2.43 },
    ],
    categories: categories7, regions: regions7, topProducts: products,
  },
  '30D': {
    period: '30D', totalRevenue: 51200000, changePct: 7.9,
    trend: [
      { label: 'W1', value: 10.1 }, { label: 'W2', value: 11.8 }, { label: 'W3', value: 11.2 },
      { label: 'W4', value: 12.9 }, { label: 'W5', value: 13.6 },
    ],
    categories: categories7.map((c) => ({ ...c, value: c.value * 4, sharePct: c.sharePct })),
    regions: regions7.map((r) => ({ ...r, value: r.value * 4 })),
    topProducts: products.map((p) => ({ ...p, units: p.units * 4, revenue: p.revenue * 4 })),
  },
  '90D': {
    period: '90D', totalRevenue: 148600000, changePct: -1.8,
    trend: [
      { label: 'Jul', value: 46.2 }, { label: 'Aug', value: 49.5 }, { label: 'Sep', value: 52.9 },
    ],
    categories: categories7.map((c) => ({ ...c, value: c.value * 11.6 })),
    regions: regions7.map((r) => ({ ...r, value: r.value * 11.6 })),
    topProducts: products.map((p) => ({ ...p, units: Math.round(p.units * 11.6), revenue: Math.round(p.revenue * 11.6) })),
  },
};
