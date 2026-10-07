import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
}

export function StatItem({ label, value }: Props) {
  return (
    <View style={styles.item}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1, gap: spacing.xs, minWidth: 80 },
  value: {
    fontSize: font.h3,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: font.caption,
    color: colors.inkMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});
