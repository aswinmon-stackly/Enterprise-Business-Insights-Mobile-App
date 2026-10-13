import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMPARISON_LABEL } from '../config/dashboard';
import { Kpi, KpiId } from '../types';
import { colors } from '../theme';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import { Card } from './Card';
import { ChangeBadge } from './ChangeBadge';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const STYLE: Record<KpiId, { icon: IconName; fg: string; bg: string }> = {
  revenue: { icon: 'cash-outline', fg: colors.primary, bg: colors.primarySoft },
  orders: { icon: 'receipt-outline', fg: colors.teal, bg: colors.tealSoft },
  customers: { icon: 'people-outline', fg: colors.purple, bg: colors.purpleSoft },
  profit: { icon: 'trending-up-outline', fg: colors.orange, bg: colors.orangeSoft },
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const s = STYLE[kpi.id];
  const value = kpi.format === 'currency' ? formatCurrencyCompact(kpi.value) : formatNumber(kpi.value);
  return (
    <Card accent={s.fg} style={styles.card}>
      <View style={styles.top} accessible accessibilityLabel={`${kpi.label} ${value}`}>
        <Text style={styles.label} numberOfLines={1}>{kpi.label}</Text>
        <View style={[styles.icon, { backgroundColor: s.bg }]}><Ionicons name={s.icon} size={22} color={s.fg} /></View>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <ChangeBadge changePct={kpi.changePct} suffix={COMPARISON_LABEL} />
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, gap: 12, borderRadius: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { flexShrink: 1, fontSize: 13, fontWeight: '700', letterSpacing: 1.2, color: colors.inkMuted, textTransform: 'uppercase' },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
});
