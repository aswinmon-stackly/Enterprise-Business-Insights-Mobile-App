import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH } from '../theme';

interface Props {
  greeting: string;
  userName: string;
  unreadCount?: number;
  onProfilePress: () => void;      // navigation is injected by the screen, never hardcoded here
  onNotificationPress: () => void;
}

export function DashboardHeader({ greeting, userName, unreadCount = 0, onProfilePress, onNotificationPress }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onProfilePress} style={styles.userBlock} accessibilityRole="button" accessibilityLabel="Open profile">
        <View style={styles.avatar}><Ionicons name="person" size={22} color={colors.primary} /></View>
        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name} numberOfLines={1}>{userName}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onNotificationPress} style={styles.bell} accessibilityRole="button" accessibilityLabel={`Notifications, ${unreadCount} unread`}>
        <Ionicons name="notifications-outline" size={24} color={colors.ink} />
        {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minHeight: MIN_TOUCH },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  textBlock: { flex: 1 },
  greeting: { fontSize: font.body, color: colors.inkMuted },
  name: { fontSize: font.h1, fontWeight: '700', color: colors.ink },
  bell: { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.negative, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
