import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { formatPct } from '../utils/format';

interface Props {
  changePct: number;
  suffix?: string;     // e.g. "vs prev. 30d"
  showSign?: boolean;  // "+12.4%" instead of "12.4%"
}

/** Up/down indicator + percentage; reused by KPI cards, the chart header and the top-category card. */
export function ChangeBadge({ changePct, suffix, showSign = false }: Props) {
  const up = changePct >= 0;
  const tint = up ? colors.positive : colors.negative;
  return (
    <View style={[styles.pill, { backgroundColor: up ? colors.positiveSoft : colors.negativeSoft }]}
      accessibilityLabel={`${up ? 'Up' : 'Down'} ${formatPct(changePct)}${suffix ? ` ${suffix}` : ''}`}>
      <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={14} color={tint} />
      <Text style={[styles.value, { color: tint }]}>{showSign ? (up ? '+' : '-') : ''}{formatPct(changePct)}</Text>
      {suffix ? <Text style={[styles.suffix, { color: tint }]} numberOfLines={1}>{suffix}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start', maxWidth: '100%' },
  value: { fontSize: 14, fontWeight: '800' },
  suffix: { fontSize: 12, fontWeight: '500', opacity: 0.8, flexShrink: 1 },
});
