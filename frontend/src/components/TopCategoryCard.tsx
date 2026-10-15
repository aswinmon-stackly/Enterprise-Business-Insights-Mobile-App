import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsOverview } from '../types/analytics';
import { colors, font } from '../theme';
import { formatCurrencyCompact, formatNumber, formatPct } from '../utils/format';
import { Card } from './Card';
import { StatItem } from './StatItem';

export function TopCategoryCard({ category }: { category: AnalyticsOverview['topCategory'] }) {
  return (
    <Card accent={colors.orange} style={styles.card}>
      <Text style={styles.label}>Top performing category</Text>
      {category ? (
        <>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.revenue}>{formatCurrencyCompact(category.revenue)}</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(category.sharePct, 100)}%` }]} /></View>
          <View style={styles.stats}>
            <StatItem label="of total sales" value={formatPct(category.sharePct)} />
            <StatItem label="qualifying orders" value={formatNumber(category.orders)} />
            <StatItem label="units sold" value={formatNumber(category.unitsSold)} />
          </View>
        </>
      ) : (
        <Text style={styles.empty}>No qualifying sales in this period.</Text>
      )}
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 22, gap: 6 },
  label: { fontSize: font.body, color: colors.inkMuted },
  name: { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  revenue: { fontSize: font.h2, fontWeight: '700', color: colors.ink },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.orangeSoft, overflow: 'hidden', marginVertical: 8 },
  fill: { height: '100%', backgroundColor: colors.orange, borderRadius: 5 },
  stats: { flexDirection: 'row', gap: 12 },
  empty: { fontSize: font.title, color: colors.inkMuted, paddingVertical: 8 },
});
