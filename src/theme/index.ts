/**
 * Design token system for Enterprise Business Insights
 *
 * STRUCTURE
 * - colors      – semantic palette (never use raw hex outside this file)
 * - gradients   – multi-stop gradient definitions (for LinearGradient)
 * - spacing     – 4 pt grid
 * - radius      – border radii
 * - font        – font sizes (pt)
 * - shadows     – elevation presets (cross-platform via boxShadow-style objects)
 * - MIN_TOUCH   – 44 pt minimum (Apple HIG + Material)
 */

export const colors = {
  /* backgrounds */
  bg: '#F0F2F8',
  bgDeep: '#E6EBF4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  /* brand – deep navy */
  primary: '#1A3A6B',
  primaryMid: '#2551A0',
  primaryLight: '#3A72D4',
  primarySoft: '#E8EFF9',
  primarySofter: '#F2F6FD',

  /* teal accent */
  teal: '#0B7F74',
  tealSoft: '#DDF5F2',

  /* ink */
  ink: '#0E1E35',
  inkMuted: '#5A6A80',
  inkFaint: '#8C9BAB',

  /* semantic */
  positive: '#127A50',
  positiveSoft: '#E0F5EC',
  negative: '#C0392B',
  negativeSoft: '#FBEAE8',
  amber: '#B7651A',
  amberSoft: '#FDF0DC',
  warning: '#D4770A',

  /* border */
  border: '#DDE4EF',
  borderStrong: '#C5D0E0',

  /* chart */
  chartLine: '#2551A0',
  chartFill: '#3A72D4',
  chartDot: '#FFFFFF',

  /* tab bar */
  tabActive: '#1A3A6B',
  tabInactive: '#8C9BAB',
  tabBg: '#FFFFFF',
} as const;

/** Gradient pairs [start, end] — used with expo-linear-gradient or react-native-linear-gradient */
export const gradients = {
  header: ['#132A52', '#1E4A9A'] as [string, string],
  headerOverlay: ['#1E4A9A', '#2A5BBF'] as [string, string],
  kpiRevenue: ['#1A3A6B', '#2551A0'] as [string, string],
  kpiOrders: ['#0B7F74', '#14A899'] as [string, string],
  kpiCustomers: ['#5E35B1', '#7E57C2'] as [string, string],
  kpiProfit: ['#B7651A', '#E0900A'] as [string, string],
  accent: ['#2551A0', '#3A72D4'] as [string, string],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const font = {
  caption: 11,
  captionMd: 12,
  body: 14,
  bodyLg: 15,
  title: 16,
  h3: 17,
  h2: 19,
  h1: 22,
  hero: 26,
  kpi: 24,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#0E1E35',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0E1E35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0E1E35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const MIN_TOUCH = 44;
