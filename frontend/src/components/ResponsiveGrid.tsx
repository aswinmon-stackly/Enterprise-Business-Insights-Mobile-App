import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

/** 2 columns on phones, 4 on tablets / landscape; rows never overflow horizontally. */
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const columns = width >= 720 ? 4 : 2;
  const items = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <View style={styles.grid}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row}
          {Array.from({ length: columns - row.length }, (_, j) => <View key={`s${j}`} style={styles.spacer} />)}
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({ grid: { gap: 12 }, row: { flexDirection: 'row', gap: 12 }, spacer: { flex: 1 } });
