import { AnalyticsFilter, PresetPeriod } from '../types/analytics';

export type FilterChipKey = PresetPeriod | 'custom';

export const FILTER_OPTIONS: { key: FilterChipKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'last_30_days', label: 'Last 30 Days' },
  { key: 'this_month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

export const PERIOD_TITLES: Record<PresetPeriod | 'custom', string> = {
  today: 'Today', last_7_days: 'Last 7 days', last_30_days: 'Last 30 days', this_month: 'This month', custom: 'Custom range',
};

/** Stable identity of a filter: the hook refetches only when this changes (no duplicate requests). */
export const filterKey = (f: AnalyticsFilter): string =>
  f.kind === 'preset' ? `preset:${f.period}` : `custom:${f.startDate}:${f.endDate}`;
