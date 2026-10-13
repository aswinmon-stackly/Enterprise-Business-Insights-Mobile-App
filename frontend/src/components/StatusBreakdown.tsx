import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusCount } from '../types';
import { colors, font } from '../theme';
import { formatNumber } from '../utils/format';

const TONE: Record<string, string> = {
  delivered: colors.positive, shipped: colors.primary, confirmed: colors.teal,
  pending: colors.amber, cancelled: colors.negative, returned: colors.purple,
};
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Orders grouped by status (counts come straight from the database via the API). */
export function StatusBreakdown({ items }: { items: StatusCount[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Orders by status</Text>
      <View style={styles.row}>
        {items.map((i) => (
          <View key={i.status} style={styles.pill} accessible accessibilityLabel={`${cap(i.status)} ${i.count}`}>
            <View style={[styles.dot, { backgroundColor: TONE[i.status] ?? colors.inkMuted }]} />
            <Text style={styles.label}>{cap(i.status)}</Text>
            <Text style={styles.count}>{formatNumber(i.count)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { marginTop: 18, gap: 10 },
  title: { fontSize: font.body, fontWeight: '700', color: colors.inkMuted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 13, color: colors.ink, fontWeight: '500' },
  count: { fontSize: 13, color: colors.ink, fontWeight: '800' },
});
