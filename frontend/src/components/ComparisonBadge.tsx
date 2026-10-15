import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MetricComparison } from '../types/analytics';
import { colors } from '../theme';
import { ChangeBadge } from './ChangeBadge';

/** Renders the backend's comparison result as-is: the app never computes or invents percentages. */
export function ComparisonBadge({ comparison, suffix = 'vs prev.' }: { comparison: MetricComparison; suffix?: string }) {
  const { direction, changePct } = comparison;
  if (direction === 'none') return null;
  if ((direction === 'up' || direction === 'down') && changePct !== null) return <ChangeBadge changePct={changePct} suffix={suffix} />;
  const isNew = direction === 'new';
  return (
    <View style={[styles.pill, { backgroundColor: isNew ? colors.primarySoft : colors.chip }]}
      accessibilityLabel={isNew ? 'New, no sales in the comparison period' : `No change ${suffix}`}>
      <Ionicons name={isNew ? 'sparkles-outline' : 'remove'} size={14} color={isNew ? colors.primary : colors.inkMuted} />
      <Text style={[styles.value, { color: isNew ? colors.primary : colors.inkMuted }]}>{isNew ? 'New' : '0.0%'}</Text>
      <Text style={[styles.suffix, { color: isNew ? colors.primary : colors.inkMuted }]} numberOfLines={1}>{isNew ? 'no prior sales' : suffix}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start', maxWidth: '100%' },
  value: { fontSize: 14, fontWeight: '800' },
  suffix: { fontSize: 12, fontWeight: '500', opacity: 0.8, flexShrink: 1 },
});
