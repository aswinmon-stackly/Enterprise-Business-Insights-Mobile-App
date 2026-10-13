import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH } from '../theme';

interface Props { title: string; actionLabel?: string; onActionPress?: () => void }

export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={styles.bar} />
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>{title}</Text>
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TOUCH },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  bar: { width: 5, height: 26, borderRadius: 3, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, flexShrink: 1, letterSpacing: -0.3 },
  action: { minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 12 },
  actionText: { fontSize: font.title, fontWeight: '700', color: colors.primary },
});
