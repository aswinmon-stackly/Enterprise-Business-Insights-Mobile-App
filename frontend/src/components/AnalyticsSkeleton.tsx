import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../theme';
import { SkeletonBlock, useSkeletonOpacity } from './Skeleton';

export function AnalyticsSkeleton() {
  const opacity = useSkeletonOpacity();
  return (
    <View style={styles.wrap} accessibilityLabel="Loading analytics" accessibilityLiveRegion="polite">
      <View style={styles.row}><SkeletonBlock opacity={opacity} style={styles.metric} /><SkeletonBlock opacity={opacity} style={styles.metric} /></View>
      <View style={styles.row}><SkeletonBlock opacity={opacity} style={styles.metric} /><SkeletonBlock opacity={opacity} style={styles.metric} /></View>
      <SkeletonBlock opacity={opacity} style={{ height: 300, borderRadius: radius.md }} />
      <SkeletonBlock opacity={opacity} style={{ height: 180, borderRadius: radius.md }} />
      <Text style={styles.text}>Loading analytics...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, height: 120, borderRadius: radius.md },
  text: { textAlign: 'center', color: colors.inkMuted, fontSize: font.body },
});
