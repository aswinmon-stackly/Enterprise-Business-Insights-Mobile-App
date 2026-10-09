import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DashboardData } from '../types';
import { colors, font } from '../theme';
import { formatCurrencyCompact, formatNumber, formatPct } from '../utils/format';
import { Card } from './Card';
import { ChangeBadge } from './ChangeBadge';
import { StatItem } from './StatItem';
import { TrendChart } from './TrendChart';

type Props = Pick<DashboardData, 'revenueTrend' | 'salesSummary' | 'topCategory'>;

export function AnalyticsPreview({ revenueTrend, salesSummary: s, topCategory: c }: Props) {
  return (
    <View style={styles.wrap}>
      <Card>
        <Text style={styles.cardTitle}>Revenue trend</Text>
        <Text style={styles.cardSub}>Last 7 days</Text>
        <View style={{ marginTop: 12 }}><TrendChart data={revenueTrend} /></View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Sales summary</Text>
        <View style={styles.stats}>
          <StatItem label="Total orders" value={formatNumber(s.totalOrders)} />
          <StatItem label="Avg. order value" value={formatCurrencyCompact(s.avgOrderValue)} />
        </View>
        <View style={styles.stats}>
          <StatItem label="Fulfilment rate" value={formatPct(s.fulfilmentRatePct)} />
          <StatItem label="Target achieved" value={`${s.targetAchievedPct}%`} />
        </View>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(s.targetAchievedPct, 100)}%` }]} /></View>
      </Card>

      <Card>
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
  wrap: { gap: 12 },
  cardTitle: { fontSize: font.title, fontWeight: '700', color: colors.ink },
  cardSub: { fontSize: font.caption + 1, color: colors.inkMuted },
  stats: { flexDirection: 'row', gap: 16, marginTop: 14 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, marginTop: 16, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.teal, borderRadius: 4 },
  catName: { fontSize: font.h1, fontWeight: '700', color: colors.ink, marginTop: 4 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  catRevenue: { fontSize: font.title, fontWeight: '600', color: colors.ink },
});
