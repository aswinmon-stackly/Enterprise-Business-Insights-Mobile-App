import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { formatPct } from '../utils/format';

/** Up/down indicator + percentage; reused by KPI cards and the top-category card. */
export function ChangeBadge({ changePct }: { changePct: number }) {
  const up = changePct >= 0;
  const tint = up ? colors.positive : colors.negative;
  const bg = up ? colors.positiveSoft : colors.negativeSoft;
  return (
    <View
      style={[styles.pill, { backgroundColor: bg }]}
      accessibilityLabel={`${up ? 'Up' : 'Down'} ${formatPct(changePct)}`}
    >
      <Ionicons
        name={up ? 'arrow-up' : 'arrow-down'}
        size={11}
        color={tint}
      />
      <Text style={[styles.text, { color: tint }]}>
        {formatPct(changePct)}
      </Text>
      <Text style={[styles.vsText, { color: tint }]}>vs last week</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700' },
  vsText: { fontSize: 9, fontWeight: '500', opacity: 0.7 },
});
