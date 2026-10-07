import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH, radius, shadow, spacing } from '../theme';

interface Props {
  greeting: string;
  userName: string;
  role?: string;
  unreadCount?: number;
  onProfilePress: () => void;   // navigation is injected by the screen, never hardcoded here
  onNotificationPress: () => void;
}

export function DashboardHeader({
  greeting,
  userName,
  role,
  unreadCount = 0,
  onProfilePress,
  onNotificationPress,
}: Props) {
  // First name only for compact display
  const firstName = userName.split(' ')[0] ?? userName;

  return (
    <View style={styles.wrapper}>
      {/* Decorative accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.inner}>
        <View style={styles.row}>
          {/* Left: Avatar + greeting */}
          <Pressable
            onPress={onProfilePress}
            style={styles.userBlock}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.name} numberOfLines={1}>
                {firstName}
              </Text>
              {role ? (
                <Text style={styles.role} numberOfLines={1}>
                  {role}
                </Text>
              ) : null}
            </View>
          </Pressable>

          {/* Right: Notification bell */}
          <Pressable
            onPress={onNotificationPress}
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.ink} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Summary chips */}
        <View style={styles.chips}>
          <View style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: colors.positive }]} />
            <Text style={styles.chipText}>All systems operational</Text>
          </View>
          <View style={[styles.chip, styles.chipAccent]}>
            <Ionicons name="calendar-outline" size={11} color={colors.primaryLight} />
            <Text style={[styles.chipText, { color: colors.primaryLight }]}>
              Q4 · Oct 2026
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.md,
    marginBottom: spacing.xs,
  },
  accentBar: {
    height: 4,
    backgroundColor: colors.primaryMid,
  },
  inner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minHeight: MIN_TOUCH,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarInitial: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.primary,
  },
  textBlock: { flex: 1 },
  greeting: {
    fontSize: font.captionMd,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  name: {
    fontSize: font.h1,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: font.h1 * 1.2,
  },
  role: {
    fontSize: font.caption,
    color: colors.inkFaint,
    fontWeight: '500',
    marginTop: 1,
  },
  bell: {
    width: MIN_TOUCH + 4,
    height: MIN_TOUCH + 4,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 17,
    height: 17,
    borderRadius: radius.pill,
    backgroundColor: colors.negative,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipAccent: {
    backgroundColor: colors.primarySofter,
    borderColor: colors.primarySoft,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: font.caption,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
