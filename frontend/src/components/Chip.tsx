import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface Props { label: string; leading?: React.ReactNode; tone?: 'neutral' | 'info' }

export function Chip({ label, leading, tone = 'neutral' }: Props) {
  const info = tone === 'info';
  return (
    <View style={[styles.chip, info ? styles.info : styles.neutral]}>
      {leading}
      <Text style={[styles.text, info && styles.infoText]} numberOfLines={1}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, maxWidth: '100%' },
  neutral: { backgroundColor: colors.chip, borderColor: colors.border },
  info: { backgroundColor: colors.primarySoft, borderColor: '#D7E2F8' },
  text: { fontSize: 13, fontWeight: '600', color: colors.ink, flexShrink: 1 },
  infoText: { color: colors.primary },
});
