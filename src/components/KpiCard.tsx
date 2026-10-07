import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Kpi, KpiId } from '../types';
import { colors, font, radius, shadow, spacing } from '../theme';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import { ChangeBadge } from './ChangeBadge';

interface IconConfig {
  name: React.ComponentProps<typeof Ionicons>['name'];
  fg: string;
  bg: string;
  accentTop: string;
}

const KPI_CONFIG: Record<KpiId, IconConfig> = {
  revenue: {
    name: 'cash-outline',
    fg: colors.primary,
    bg: colors.primarySoft,
    accentTop: colors.primaryLight,
  },
  orders: {
    name: 'receipt-outline',
    fg: colors.teal,
    bg: colors.tealSoft,
    accentTop: colors.teal,
  },
  customers: {
    name: 'people-outline',
    fg: '#6C4DB8',
    bg: '#EDE8F9',
    accentTop: '#8A6DD6',
  },
  profit: {
    name: 'trending-up-outline',
    fg: colors.amber,
    bg: colors.amberSoft,
    accentTop: colors.warning,
  },
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const cfg = KPI_CONFIG[kpi.id];
  const value =
    kpi.format === 'currency'
      ? formatCurrencyCompact(kpi.value)
      : formatNumber(kpi.value);

  return (
    <View
      style={[styles.card, { borderTopColor: cfg.accentTop }]}
      accessible
      accessibilityLabel={`${kpi.label} ${value}`}
    >
      {/* Top row: label + icon */}
      <View style={styles.topRow}>
        <Text style={styles.label} numberOfLines={1}>
          {kpi.label}
        </Text>
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.name} size={15} color={cfg.fg} />
        </View>
      </View>

      {/* Value */}
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>

      {/* Change badge */}
      <ChangeBadge changePct={kpi.changePct} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    flex: 1,
    ...shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: font.captionMd,
    color: colors.inkMuted,
    fontWeight: '600',
    flexShrink: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: font.kpi,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
});
