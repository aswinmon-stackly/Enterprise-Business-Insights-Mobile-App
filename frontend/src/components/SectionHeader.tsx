import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, MIN_TOUCH } from '../theme';

interface Props { title: string; actionLabel?: string; onActionPress?: () => void }

export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TOUCH - 12 },
  title: { fontSize: font.h2, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  action: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingLeft: 12 },
  actionText: { fontSize: font.body, fontWeight: '600', color: colors.primary },
});
