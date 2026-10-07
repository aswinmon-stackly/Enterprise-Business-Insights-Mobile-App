import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity, ActivityType } from '../types';
import { colors, font, MIN_TOUCH, radius, spacing } from '../theme';

interface ActivityMeta {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  fg: string;
  bg: string;
  tag: string;
}

const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  order: {
    icon: 'receipt-outline',
    fg: colors.primary,
    bg: colors.primarySoft,
    tag: 'Order',
  },
  target: {
    icon: 'flag-outline',
    fg: colors.teal,
    bg: colors.tealSoft,
    tag: 'Target',
  },
  customer: {
    icon: 'person-add-outline',
    fg: colors.positive,
    bg: colors.positiveSoft,
    tag: 'Customer',
  },
  alert: {
    icon: 'warning-outline',
    fg: colors.amber,
    bg: colors.amberSoft,
    tag: 'Alert',
  },
};

interface Props {
  activity: Activity;
  onPress?: (a: Activity) => void;
  isLast?: boolean;
}

export function ActivityItem({ activity: a, onPress, isLast }: Props) {
  const m = ACTIVITY_META[a.type];
  const isMonetary = a.type === 'order';

  return (
    <Pressable
      onPress={onPress ? () => onPress(a) : undefined}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divider,
        pressed && styles.pressed,
      ]}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${a.title}, ${a.subtitle}, ${a.meta}`}
    >
      {/* Icon badge */}
      <View style={[styles.iconWrap, { backgroundColor: m.bg }]}>
        <Ionicons name={m.icon} size={19} color={m.fg} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {a.title}
          </Text>
          <View style={[styles.typeTag, { backgroundColor: m.bg }]}>
            <Text style={[styles.typeTagText, { color: m.fg }]}>{m.tag}</Text>
          </View>
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {a.subtitle}
        </Text>
      </View>

      {/* Meta (amount or time) */}
      <Text
        style={[styles.meta, isMonetary && styles.metaAmount]}
        numberOfLines={1}
      >
        {a.meta}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 12,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.55 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: { flex: 1, gap: 2 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: font.bodyLg,
    fontWeight: '600',
    color: colors.ink,
    flexShrink: 1,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: font.captionMd,
    color: colors.inkMuted,
    fontWeight: '400',
  },
  meta: {
    fontSize: font.captionMd,
    color: colors.inkFaint,
    maxWidth: '30%',
    textAlign: 'right',
    fontWeight: '500',
  },
  metaAmount: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.ink,
  },
});
