import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH, radius, spacing } from '../theme';

interface Props {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        <View style={styles.dot} />
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primaryMid} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH - 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.primaryMid,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '700',
    color: colors.ink,
    flexShrink: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    paddingLeft: spacing.md,
  },
  actionText: {
    fontSize: font.body,
    fontWeight: '600',
    color: colors.primaryMid,
  },
});
