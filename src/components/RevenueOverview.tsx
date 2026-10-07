import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsData } from '../types';
import { colors, font } from '../theme';
import { formatCurrencyCompact } from '../utils/format';
import { Card } from './Card';
import { ChangeBadge } from './ChangeBadge';
import { TrendChart } from './TrendChart';

const PERIOD_TEXT = { '7D': 'last 7 days', '30D': 'last 30 days', '90D': 'last 90 days' } as const;

export function RevenueOverview({ data }: { data: Pick<AnalyticsData, 'period' | 'totalRevenue' | 'changePct' | 'trend'> }) {
  return (
    <Card>
      <Text style={styles.sub}>Total revenue, {PERIOD_TEXT[data.period]}</Text>
      <View style={styles.row}>
        <Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>{formatCurrencyCompact(data.totalRevenue)}</Text>
        <ChangeBadge changePct={data.changePct} />
      </View>
      <Text style={styles.sub}>compared with the previous period</Text>
      <View style={{ marginTop: 16 }}><TrendChart data={data.trend} height={200} /></View>
    </Card>
  );
}
const styles = StyleSheet.create({
  sub: { fontSize: font.caption + 1, color: colors.inkMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  total: { fontSize: 30, fontWeight: '800', color: colors.ink, flexShrink: 1 },
});
