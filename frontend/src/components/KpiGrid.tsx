import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Kpi } from '../types';
import { KpiCard } from './KpiCard';

/** 2 columns on phones, 4 on tablets / landscape. Rows are chunked so cards never overflow horizontally. */
export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  const { width } = useWindowDimensions();
  const columns = width >= 720 ? 4 : 2;
  const rows: Kpi[][] = [];
  for (let i = 0; i < kpis.length; i += columns) rows.push(kpis.slice(i, i + columns));
  return (
    <View style={styles.grid}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((k) => <KpiCard key={k.id} kpi={k} />)}
          {Array.from({ length: columns - row.length }, (_, j) => <View key={`s${j}`} style={styles.spacer} />)}
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({ grid: { gap: 12 }, row: { flexDirection: 'row', gap: 12 }, spacer: { flex: 1 } });
