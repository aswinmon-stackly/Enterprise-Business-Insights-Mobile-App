import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DashboardData } from '../types';
import { colors, font } from '../theme';
import { formatCurrencyCompact, formatNumber, formatPct } from '../utils/format';
import { Card } from './Card';
import { ChangeBadge } from './ChangeBadge';
import { StatItem } from './StatItem';
import { StatusBreakdown } from './StatusBreakdown';
import { TrendChart } from './TrendChart';

type Props = Pick<DashboardData, 'revenueTrend' | 'revenueTrendChangePct' | 'salesSummary' | 'topCategory'>;

export function AnalyticsPreview({ revenueTrend, revenueTrendChangePct, salesSummary: s, topCategory: c }: Props) {
  return (
    <View style={styles.wrap}>
      <Card accent={colors.primary} style={styles.card}>
        <View style={styles.headRow}>
          <View style={styles.headText}>
            <Text style={styles.cardTitle}>Revenue Trend</Text>
            <Text style={styles.cardSub}>Last 7 days · daily revenue</Text>
          </View>
          <ChangeBadge changePct={revenueTrendChangePct} showSign />
        </View>
        <View style={{ marginTop: 8 }}><TrendChart data={revenueTrend} formatValue={formatCurrencyCompact} /></View>
      </Card>

      <Card accent={colors.teal} style={styles.card}>
        <Text style={styles.cardTitle}>Sales Summary</Text>
        <View style={styles.stats}>
          <StatItem label="Orders placed" value={formatNumber(s.totalOrders)} />
          <StatItem label="Avg. order value" value={formatCurrencyCompact(s.avgOrderValue)} />
        </View>
        <View style={styles.stats}>
          <StatItem label="Fulfilment rate" value={formatPct(s.fulfilmentRatePct)} />
          <StatItem label="Target achieved" value={`${s.targetAchievedPct}%`} />
        </View>
        <StatusBreakdown items={s.statusBreakdown} />
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(s.targetAchievedPct, 100)}%` }]} /></View>
      </Card>

      <Card accent={colors.orange} style={styles.card}>
        <Text style={styles.cardSub}>Top performing category</Text>
        <Text style={styles.catName}>{c.name}</Text>
        <View style={styles.catRow}>
          <Text style={styles.catRevenue}>{formatCurrencyCompact(c.revenue)}</Text>
          <ChangeBadge changePct={c.changePct} />
        </View>
        <Text style={styles.cardSub}>{formatPct(c.sharePct)} of total revenue</Text>
      </Card>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { gap: 14 },
  card: { padding: 18, borderRadius: 22 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  headText: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  cardSub: { fontSize: font.body, color: colors.inkMuted, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 16, marginTop: 16 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.tealSoft, marginTop: 18, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.teal, borderRadius: 5 },
  catName: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: 6, letterSpacing: -0.3 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  catRevenue: { fontSize: font.h2, fontWeight: '700', color: colors.ink },
});
