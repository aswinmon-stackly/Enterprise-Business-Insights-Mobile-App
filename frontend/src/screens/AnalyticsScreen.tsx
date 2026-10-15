import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsSkeleton } from '../components/AnalyticsSkeleton';
import { CustomRangePicker } from '../components/CustomRangePicker';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterChips } from '../components/FilterChips';
import { MetricCard } from '../components/MetricCard';
import { PerformanceCard } from '../components/PerformanceCard';
import { PeriodHeader } from '../components/PeriodHeader';
import { ResponsiveGrid } from '../components/ResponsiveGrid';
import { RevenueTrendCard } from '../components/RevenueTrendCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatusDistribution } from '../components/StatusDistribution';
import { TopCategoryCard } from '../components/TopCategoryCard';
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { colors, font } from '../theme';
import { AnalyticsFilter, PresetPeriod } from '../types/analytics';
import { FilterChipKey } from '../utils/analyticsFilter';
import { addDays, formatRange, todayISO, validateCustomRange } from '../utils/dates';
import { formatCurrencyCompact, formatNumber } from '../utils/format';

/** No fetch() here: the screen owns the filter selection and renders what the hook returns. */
export function AnalyticsScreen() {
  const today = todayISO();
  const [filter, setFilter] = useState<AnalyticsFilter>({ kind: 'preset', period: 'last_7_days' });
  const [customOpen, setCustomOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(addDays(today, -6));
  const [draftEnd, setDraftEnd] = useState(today);
  const { data, loading, refreshing, error, refresh, retry } = useAnalyticsOverview(filter);

  const rangeError = validateCustomRange(draftStart, draftEnd);
  const activeChip: FilterChipKey = customOpen || filter.kind === 'custom' ? 'custom' : filter.period;

  const selectPreset = useCallback((period: PresetPeriod) => {
    setCustomOpen(false);
    // Same filter again -> keep the same object, so nothing re-renders or refetches.
    setFilter((prev) => (prev.kind === 'preset' && prev.period === period ? prev : { kind: 'preset', period }));
  }, []);

  const onChip = (key: FilterChipKey) => (key === 'custom' ? setCustomOpen((open) => !open) : selectPreset(key));

  const applyCustom = () => {
    if (rangeError) return;
    setFilter((prev) => (prev.kind === 'custom' && prev.startDate === draftStart && prev.endDate === draftEnd
      ? prev : { kind: 'custom', startDate: draftStart, endDate: draftEnd }));
  };

  const m = data?.metrics;
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">Analytics</Text>
        <Text style={styles.subtitle}>Explore performance over time</Text>
      </View>

      <View style={styles.block}>
        <FilterChips value={activeChip} onSelect={onChip} />
        {customOpen ? (
          <CustomRangePicker start={draftStart} end={draftEnd} maxDate={today} error={rangeError}
            onChangeStart={setDraftStart} onChangeEnd={setDraftEnd} onApply={applyCustom} />
        ) : null}
      </View>

      {loading && !data ? (
        <AnalyticsSkeleton />
      ) : !data ? (
        <ErrorState message={error ?? 'Something went wrong.'} onRetry={retry} />
      ) : (
        <View style={[styles.block, loading && styles.updating]}>
          {error ? <ErrorState compact message={error} onRetry={retry} /> : null}
          <PeriodHeader period={data.period} comparison={data.comparison} updating={loading} />
          {data.isEmpty ? (
            <EmptyState icon="analytics-outline" title="No orders in this period"
              message={`There are no orders between ${formatRange(data.period.startDate, data.period.endDate)}. Try a wider date range.`} />
          ) : (
            <>
              <ResponsiveGrid>
                <MetricCard label="Revenue" valueText={formatCurrencyCompact(m!.revenue.value)} icon="cash-outline" accent={colors.primary} tint={colors.primarySoft} comparison={m!.revenue} />
                <MetricCard label="Orders" valueText={formatNumber(m!.orders.value)} icon="receipt-outline" accent={colors.teal} tint={colors.tealSoft} comparison={m!.orders} />
                <MetricCard label="Profit" valueText={formatCurrencyCompact(m!.profit.value)} icon="trending-up-outline" accent={colors.orange} tint={colors.orangeSoft} comparison={m!.profit} />
                <MetricCard label="Customers" valueText={formatNumber(m!.customers.value)} icon="people-outline" accent={colors.purple} tint={colors.purpleSoft} comparison={m!.customers} />
              </ResponsiveGrid>
              <RevenueTrendCard overview={data} />
              <TopCategoryCard category={data.topCategory} />
              <StatusDistribution items={data.orderStatusBreakdown} />
              <PerformanceCard performance={data.performance} />
              <Text style={styles.note}>
                Dates and daily totals use the {data.period.timezone} time zone. The current day is still in progress, so
                comparisons that include it can look lower.
              </Text>
            </>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  head: { gap: 2 },
  title: { fontSize: font.h1 + 4, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: font.body, color: colors.inkMuted },
  block: { gap: 12 },
  updating: { opacity: 0.55, pointerEvents: 'none' }, // intentional: the previous result stays visible, dimmed, while the new period loads
  note: { fontSize: font.caption + 1, color: colors.inkMuted, lineHeight: 17, paddingHorizontal: 4 },
});
