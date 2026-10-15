import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MetricComparison } from '../types/analytics';
import { colors } from '../theme';
import { Card } from './Card';
import { ComparisonBadge } from './ComparisonBadge';

interface Props {
  label: string;
  valueText: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  tint: string;
  comparison: MetricComparison;
}

export function MetricCard({ label, valueText, icon, accent, tint, comparison }: Props) {
  return (
    <Card accent={accent} style={styles.card}>
      <View style={styles.top} accessible accessibilityLabel={`${label} ${valueText}`}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <View style={[styles.icon, { backgroundColor: tint }]}><Ionicons name={icon} size={20} color={accent} /></View>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{valueText}</Text>
      <ComparisonBadge comparison={comparison} />
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, gap: 10, borderRadius: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { flexShrink: 1, fontSize: 13, fontWeight: '700', letterSpacing: 1.2, color: colors.inkMuted, textTransform: 'uppercase' },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
});
