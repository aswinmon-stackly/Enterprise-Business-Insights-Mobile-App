import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TopProduct } from '../types';
import { colors, font } from '../theme';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import { Card } from './Card';

export function TopProductsList({ title, items }: { title: string; items: TopProduct[] }) {
  return (
    <Card style={{ paddingBottom: 4 }}>
      <Text style={styles.title}>{title}</Text>
      {items.map((p, i) => (
        <View key={p.id} style={[styles.row, i < items.length - 1 && styles.divider]}>
          <View style={styles.rank}><Text style={styles.rankText}>{i + 1}</Text></View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.sub} numberOfLines={1}>{p.category} · {formatNumber(p.units)} units</Text>
          </View>
          <Text style={styles.rev}>{formatCurrencyCompact(p.revenue)}</Text>
        </View>
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: font.title, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 60 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: font.caption + 1, fontWeight: '700', color: colors.primary },
  info: { flex: 1, gap: 2 },
  name: { fontSize: font.body + 1, fontWeight: '600', color: colors.ink },
  sub: { fontSize: font.caption + 1, color: colors.inkMuted },
  rev: { fontSize: font.body + 1, fontWeight: '700', color: colors.ink },
});
