import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH, radius } from '../theme';

interface Props { message: string; onRetry: () => void; compact?: boolean }

/** Full-screen variant when there is no data; compact banner when stale data is still on screen. */
export function ErrorState({ message, onRetry, compact = false }: Props) {
  if (compact) {
    return (
      <View style={styles.banner} accessibilityRole="alert">
        <Ionicons name="cloud-offline-outline" size={20} color={colors.negative} />
        <Text style={styles.bannerText} numberOfLines={2}>{message} Showing the last loaded data.</Text>
        <Pressable onPress={onRetry} style={styles.bannerBtn} accessibilityRole="button"><Text style={styles.link}>Retry</Text></Pressable>
      </View>
    );
  }
  return (
    <View style={styles.center} accessibilityRole="alert">
      <View style={styles.circle}><Ionicons name="cloud-offline-outline" size={36} color={colors.negative} /></View>
      <Text style={styles.title}>Couldn't load dashboard</Text>
      <Text style={styles.msg}>{message}</Text>
      <Pressable onPress={onRetry} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} accessibilityRole="button">
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 10, paddingVertical: 80, paddingHorizontal: 12 },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.negativeSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.h2, fontWeight: '700', color: colors.ink },
  msg: { fontSize: font.body, color: colors.inkMuted, textAlign: 'center', maxWidth: 300 },
  button: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: MIN_TOUCH, paddingHorizontal: 24, borderRadius: radius.md, backgroundColor: colors.primary, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: font.title, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.negativeSoft, borderRadius: radius.md, paddingLeft: 12, minHeight: MIN_TOUCH },
  bannerText: { flex: 1, fontSize: font.caption + 1, color: colors.ink },
  bannerBtn: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: 14 },
  link: { fontSize: font.body, fontWeight: '700', color: colors.primary },
});
