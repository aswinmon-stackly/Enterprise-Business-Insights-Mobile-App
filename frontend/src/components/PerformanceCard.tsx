import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsOverview } from '../types/analytics';
import { colors, font } from '../theme';
import { formatCurrencyCompact, formatPct } from '../utils/format';
import { formatDayMonth } from '../utils/dates';
import { Card } from './Card';
import { StatItem } from './StatItem';

export function PerformanceCard({ performance: p }: { performance: AnalyticsOverview['performance'] }) {
  return (
    <Card accent={colors.purple} style={styles.card}>
      <Text style={styles.title}>Sales performance</Text>
      <View style={styles.row}>
        <StatItem label="Avg. order value" value={formatCurrencyCompact(p.averageOrderValue)} />
        <StatItem label="Profit margin" value={formatPct(p.profitMarginPct)} />
      </View>
      <View style={styles.row}>
        <StatItem label="Delivered of orders placed" value={formatPct(p.completionRatePct)} />
        <StatItem label="Cancellation rate" value={formatPct(p.cancellationRatePct)} />
      </View>
      <View style={styles.row}>
        <StatItem label="Avg. revenue per day" value={formatCurrencyCompact(p.averageDailyRevenue)} />
        <StatItem label={p.bestDay ? `Best day · ${formatDayMonth(p.bestDay.date)}` : 'Best day'} value={p.bestDay ? formatCurrencyCompact(p.bestDay.revenue) : '—'} />
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 22 },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  row: { flexDirection: 'row', gap: 16, marginTop: 16 },
});
