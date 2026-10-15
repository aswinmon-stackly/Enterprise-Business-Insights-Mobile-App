import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsOverview } from '../types/analytics';
import { colors, font } from '../theme';
import { formatCurrencyCompact } from '../utils/format';
import { formatDayMonth, formatRange } from '../utils/dates';
import { Card } from './Card';
import { TrendChart } from './TrendChart';

export function RevenueTrendCard({ overview }: { overview: AnalyticsOverview }) {
  const { period, revenueTrend, metrics } = overview;
  const points = useMemo(() => revenueTrend.map((p) => ({ label: formatDayMonth(p.date), value: p.revenue })), [revenueTrend]);
  return (
    <Card accent={colors.primary} style={styles.card}>
      <Text style={styles.title}>Revenue trend</Text>
      <Text style={styles.sub}>{formatRange(period.startDate, period.endDate)} · tap the chart for a day</Text>
      <Text style={styles.total}>{formatCurrencyCompact(metrics.revenue.value)}<Text style={styles.totalSub}>  total</Text></Text>
      <View style={{ marginTop: 6 }}>
        <TrendChart data={points} height={230} formatValue={formatCurrencyCompact} showYAxis zeroBaseline tooltipWithLabel
          emptyMessage="No sales in this period" accessibilityLabel={`Revenue per day, ${formatRange(period.startDate, period.endDate)}`} />
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 22 },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sub: { fontSize: font.body, color: colors.inkMuted, marginTop: 2 },
  total: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: 10 },
  totalSub: { fontSize: font.body, fontWeight: '500', color: colors.inkMuted },
});
