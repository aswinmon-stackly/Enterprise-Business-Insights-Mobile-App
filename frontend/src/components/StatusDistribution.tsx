import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsOverview } from '../types/analytics';
import { colors, font } from '../theme';
import { STATUS_COLORS, statusLabel } from '../theme/status';
import { formatNumber, formatPct } from '../utils/format';
import { Card } from './Card';

export function StatusDistribution({ items }: { items: AnalyticsOverview['orderStatusBreakdown'] }) {
  const placed = items.reduce((sum, i) => sum + i.count, 0);
  return (
    <Card accent={colors.teal} style={styles.card}>
      <Text style={styles.title}>Orders by status</Text>
      <Text style={styles.sub}>{formatNumber(placed)} orders placed in this period</Text>
      <View style={styles.bar} accessibilityLabel="Order status distribution">
        {items.filter((i) => i.count > 0).map((i) => <View key={i.status} style={{ flex: i.count, backgroundColor: STATUS_COLORS[i.status] }} />)}
      </View>
      {items.map((i) => (
        <View key={i.status} style={styles.row} accessible accessibilityLabel={`${statusLabel(i.status)} ${i.count} orders, ${formatPct(i.sharePct)}`}>
          <View style={[styles.dot, { backgroundColor: STATUS_COLORS[i.status] }]} />
          <Text style={styles.name}>{statusLabel(i.status)}</Text>
          <Text style={styles.count}>{formatNumber(i.count)}</Text>
          <Text style={styles.pct}>{formatPct(i.sharePct)}</Text>
        </View>
      ))}
      <Text style={styles.note}>Revenue, profit, orders and customers count confirmed, shipped and delivered orders only. Pending, cancelled and returned orders are shown here but excluded from financial metrics.</Text>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 22, gap: 10 },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sub: { fontSize: font.body, color: colors.inkMuted, marginTop: -6 },
  bar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: colors.chip, gap: 2, marginVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontSize: font.body + 1, color: colors.ink, fontWeight: '500' },
  count: { fontSize: font.body + 1, fontWeight: '800', color: colors.ink, minWidth: 44, textAlign: 'right' },
  pct: { fontSize: font.body, color: colors.inkMuted, minWidth: 52, textAlign: 'right' },
  note: { fontSize: font.caption + 1, color: colors.inkMuted, marginTop: 4, lineHeight: 17 },
});
