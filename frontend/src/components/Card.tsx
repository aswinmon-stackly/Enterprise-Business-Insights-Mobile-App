import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
});
