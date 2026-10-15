import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, ViewStyle } from 'react-native';

/** Shared pulse animation for loading placeholders. */
export function useSkeletonOpacity(): Animated.Value {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: native }),
      Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: native }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return opacity;
}

export function SkeletonBlock({ style, opacity }: { style: ViewStyle; opacity: Animated.Value }) {
  return <Animated.View style={[styles.block, style, { opacity }]} />;
}
const styles = StyleSheet.create({ block: { backgroundColor: '#DCE3EC', borderRadius: 8 } });
