import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../theme';
import { ScreenContainer } from './ScreenContainer';

interface Props { title: string; description: string; icon: React.ComponentProps<typeof Ionicons>['name'] }

export function PlaceholderScreen({ title, description, icon }: Props) {
  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.center}>
        <View style={styles.circle}><Ionicons name={icon} size={36} color={colors.primary} /></View>
        <Text style={styles.heading}>Coming soon</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: font.h1 + 4, fontWeight: '800', color: colors.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: font.h2, fontWeight: '700', color: colors.ink },
  desc: { fontSize: font.body, color: colors.inkMuted, textAlign: 'center', maxWidth: 300 },
});
