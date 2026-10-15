import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH } from '../theme';
import { initialOf } from '../utils/format';
import { Card } from './Card';
import { Chip } from './Chip';

export type SystemStatus = 'operational' | 'degraded';

interface Props {
  greeting: string;
  userName: string;
  role: string;
  status: SystemStatus;
  unreadCount?: number;
  onProfilePress: () => void;    
  onNotificationPress: () => void;
}
const getTodayDate = () => {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(',', '');
};

export function DashboardHeader({ greeting, userName, role, status, unreadCount = 0, onProfilePress, onNotificationPress }: Props) {
  const ok = status === 'operational';
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Pressable onPress={onProfilePress} style={styles.user} accessibilityRole="button" accessibilityLabel="Open profile">
          <View style={styles.avatar}><Text style={styles.avatarText}>{initialOf(userName)}</Text></View>
          <View style={styles.texts}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.name} numberOfLines={1}>{userName}</Text>
            {role ? <Text style={styles.role} numberOfLines={1}>{role}</Text> : null}
          </View>
        </Pressable>
        <Pressable onPress={onNotificationPress} style={styles.bell} accessibilityRole="button" accessibilityLabel={`Notifications, ${unreadCount} unread`}>
          <Ionicons name="notifications-outline" size={26} color={colors.ink} />
          {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
        </Pressable>
      </View>
      <View style={styles.chips}>
        <Chip label={ok ? 'All systems operational' : 'Connection issue'}
          leading={<View style={[styles.dot, { backgroundColor: ok ? colors.positive : colors.negative }]} />} />
        <Chip tone="info" label={getTodayDate()} leading={<Ionicons name="calendar-outline" size={16} color={colors.primary} />} />
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 18, gap: 16, borderRadius: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  user: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minHeight: MIN_TOUCH },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: colors.primary, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800', color: colors.primaryDark },
  texts: { flex: 1 },
  greeting: { fontSize: font.body, color: colors.inkMuted },
  name: { fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  role: { fontSize: font.body, color: colors.inkMuted, marginTop: 1 },
  bell: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.negative, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: colors.surface },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
