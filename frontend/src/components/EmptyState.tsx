import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../theme';
import { Card } from './Card';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function EmptyState({ icon = 'file-tray-outline', title, message }: { icon?: IconName; title: string; message: string }) {
  return (
    <Card style={styles.card}>
      <View style={styles.circle}><Ionicons name={icon} size={30} color={colors.primary} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.h2, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  message: { fontSize: font.body, color: colors.inkMuted, textAlign: 'center', maxWidth: 300 },
});
