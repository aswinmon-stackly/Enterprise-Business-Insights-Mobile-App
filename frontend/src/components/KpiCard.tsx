import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Kpi, KpiId } from '../types';
import { colors, font, radius } from '../theme';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import { ChangeBadge } from './ChangeBadge';

const ICONS: Record<KpiId, React.ComponentProps<typeof Ionicons>['name']> = {
  revenue: 'cash-outline', orders: 'receipt-outline', customers: 'people-outline', profit: 'trending-up-outline',
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const value = kpi.format === 'currency' ? formatCurrencyCompact(kpi.value) : formatNumber(kpi.value);
  return (
    <View style={styles.card} accessible accessibilityLabel={`${kpi.label} ${value}`}>
      <View style={styles.top}>
        <Text style={styles.label} numberOfLines={1}>{kpi.label}</Text>
        <View style={styles.icon}><Ionicons name={ICONS[kpi.id]} size={16} color={colors.primary} /></View>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <ChangeBadge changePct={kpi.changePct} />
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 8, borderWidth: 1, borderColor: colors.border, flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: font.body, color: colors.inkMuted, flexShrink: 1 },
  icon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: font.kpi + 4, fontWeight: '800', color: colors.ink },
});
