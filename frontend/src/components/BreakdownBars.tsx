import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BreakdownItem } from '../types';
import { colors, font } from '../theme';
import { formatCurrencyCompact, formatPct } from '../utils/format';
import { Card } from './Card';

interface Props { title: string; items: BreakdownItem[]; color?: string }

/** Horizontal bar list. Bar widths are relative to the largest item, so it never overflows. */
export function BreakdownBars({ title, items, color = colors.primary }: Props) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {items.map((i) => (
          <View key={i.id} style={styles.item} accessible accessibilityLabel={`${i.label} ${formatCurrencyCompact(i.value)}, ${formatPct(i.sharePct)}`}>
            <View style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>{i.label}</Text>
              <Text style={styles.value}>{formatCurrencyCompact(i.value)}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(i.value / max) * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.share}>{formatPct(i.sharePct)} of total</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: font.title, fontWeight: '700', color: colors.ink },
  list: { gap: 16, marginTop: 14 },
  item: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  label: { flex: 1, fontSize: font.body, color: colors.ink, fontWeight: '600' },
  value: { fontSize: font.body, color: colors.ink, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  share: { fontSize: font.caption, color: colors.inkMuted },
});
