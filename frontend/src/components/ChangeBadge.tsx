import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { formatPct } from '../utils/format';

/** Up/down indicator + percentage; reused by KPI cards and the top-category card. */
export function ChangeBadge({ changePct }: { changePct: number }) {
  const up = changePct >= 0;
  const tint = up ? colors.positive : colors.negative;
  return (
    <View style={[styles.pill, { backgroundColor: up ? colors.positiveSoft : colors.negativeSoft }]}
      accessibilityLabel={`${up ? 'Up' : 'Down'} ${formatPct(changePct)}`}>
      <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={12} color={tint} />
      <Text style={[styles.text, { color: tint }]}>{formatPct(changePct)}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
