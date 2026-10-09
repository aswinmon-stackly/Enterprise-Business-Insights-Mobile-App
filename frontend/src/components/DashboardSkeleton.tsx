import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font, radius } from '../theme';

function Block({ style, opacity }: { style: ViewStyle; opacity: Animated.Value }) {
  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

/** Placeholder shaped like the real dashboard so the layout doesn't jump when data arrives. */
export function DashboardSkeleton() {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.wrap} accessibilityLabel="Loading dashboard" accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <Block opacity={opacity} style={{ width: 46, height: 46, borderRadius: 23 }} />
        <View style={{ gap: 6 }}>
          <Block opacity={opacity} style={{ width: 90, height: 12 }} />
          <Block opacity={opacity} style={{ width: 150, height: 18 }} />
        </View>
      </View>
      <View style={styles.row}>
        <Block opacity={opacity} style={styles.kpi} />
        <Block opacity={opacity} style={styles.kpi} />
      </View>
      <View style={styles.row}>
        <Block opacity={opacity} style={styles.kpi} />
        <Block opacity={opacity} style={styles.kpi} />
      </View>
      <Block opacity={opacity} style={{ height: 220, borderRadius: radius.md }} />
      <Text style={styles.text}>Loading dashboard...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  block: { backgroundColor: '#DCE3EC', borderRadius: 8 },
  kpi: { flex: 1, height: 104, borderRadius: radius.md },
  text: { textAlign: 'center', color: colors.inkMuted, fontSize: font.body, marginTop: 4 },
});
