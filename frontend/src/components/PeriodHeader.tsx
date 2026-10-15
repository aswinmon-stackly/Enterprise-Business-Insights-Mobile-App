import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsOverview } from '../types/analytics';
import { colors, font } from '../theme';
import { PERIOD_TITLES } from '../utils/analyticsFilter';
import { formatRange } from '../utils/dates';
import { Card } from './Card';

/** The selected reporting period and what it is compared with, exactly as resolved by the backend. */
export function PeriodHeader({ period, comparison, updating }: { period: AnalyticsOverview['period']; comparison: AnalyticsOverview['comparison']; updating: boolean }) {
  return (
    <Card style={styles.card}>
      <View style={styles.icon}><Ionicons name="calendar" size={22} color={colors.primary} /></View>
      <View style={styles.texts}>
        <Text style={styles.title}>{PERIOD_TITLES[period.preset]}</Text>
        <Text style={styles.range}>{formatRange(period.startDate, period.endDate)} · {period.days} {period.days === 1 ? 'day' : 'days'}</Text>
        {comparison ? <Text style={styles.sub}>vs {formatRange(comparison.startDate, comparison.endDate)}</Text> : null}
      </View>
      {updating ? <ActivityIndicator size="small" color={colors.primary} accessibilityLabel="Updating" /> : null}
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 1 },
  title: { fontSize: font.title + 1, fontWeight: '800', color: colors.ink },
  range: { fontSize: font.body, color: colors.ink },
  sub: { fontSize: font.caption + 1, color: colors.inkMuted },
});
