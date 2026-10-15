import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../theme';
import { SkeletonBlock, useSkeletonOpacity } from './Skeleton';

/** Placeholder shaped like the real dashboard so the layout doesn't jump when data arrives. */
export function DashboardSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View style={styles.wrap} accessibilityLabel="Loading dashboard" accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <SkeletonBlock opacity={opacity} style={{ width: 46, height: 46, borderRadius: 23 }} />
        <View style={{ gap: 6 }}>
          <SkeletonBlock opacity={opacity} style={{ width: 90, height: 12 }} />
          <SkeletonBlock opacity={opacity} style={{ width: 150, height: 18 }} />
        </View>
      </View>
      <View style={styles.row}><SkeletonBlock opacity={opacity} style={styles.kpi} /><SkeletonBlock opacity={opacity} style={styles.kpi} /></View>
      <View style={styles.row}><SkeletonBlock opacity={opacity} style={styles.kpi} /><SkeletonBlock opacity={opacity} style={styles.kpi} /></View>
      <SkeletonBlock opacity={opacity} style={{ height: 220, borderRadius: radius.md }} />
      <Text style={styles.text}>Loading dashboard...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  kpi: { flex: 1, height: 104, borderRadius: radius.md },
  text: { textAlign: 'center', color: colors.inkMuted, fontSize: font.body, marginTop: 4 },
});
