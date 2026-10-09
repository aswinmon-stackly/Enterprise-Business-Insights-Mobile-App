import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';

export function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  item: { flex: 1, gap: 2 },
  value: { fontSize: font.title + 2, fontWeight: '700', color: colors.ink },
  label: { fontSize: font.caption, color: colors.inkMuted },
});
