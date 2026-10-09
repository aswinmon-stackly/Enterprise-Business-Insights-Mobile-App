import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity, ActivityType } from '../types';
import { colors, font, MIN_TOUCH } from '../theme';

const META: Record<ActivityType, { icon: React.ComponentProps<typeof Ionicons>['name']; fg: string; bg: string }> = {
  order: { icon: 'receipt-outline', fg: colors.primary, bg: colors.primarySoft },
  target: { icon: 'flag-outline', fg: colors.teal, bg: '#DDF3F0' },
  customer: { icon: 'person-add-outline', fg: colors.positive, bg: colors.positiveSoft },
  alert: { icon: 'warning-outline', fg: colors.amber, bg: colors.amberSoft },
};

interface Props { activity: Activity; onPress?: (a: Activity) => void; isLast?: boolean }

export function ActivityItem({ activity: a, onPress, isLast }: Props) {
  const m = META[a.type];
  return (
    <Pressable onPress={onPress ? () => onPress(a) : undefined} disabled={!onPress}
      style={({ pressed }) => [styles.row, !isLast && styles.divider, pressed && { opacity: 0.6 }]}>
      <View style={[styles.icon, { backgroundColor: m.bg }]}><Ionicons name={m.icon} size={20} color={m.fg} /></View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>{a.title}</Text>
        <Text style={styles.sub} numberOfLines={1}>{a.subtitle}</Text>
      </View>
      <Text style={[styles.meta, a.type === 'order' && styles.amount]} numberOfLines={1}>{a.meta}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: MIN_TOUCH + 16, paddingVertical: 10 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: font.body + 1, fontWeight: '600', color: colors.ink },
  sub: { fontSize: font.caption + 1, color: colors.inkMuted },
  meta: { fontSize: font.caption + 1, color: colors.inkMuted, maxWidth: '32%', textAlign: 'right' },
  amount: { fontSize: font.body + 1, fontWeight: '700', color: colors.ink },
});
