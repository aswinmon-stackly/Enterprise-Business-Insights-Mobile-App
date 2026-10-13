import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

interface Props { children: React.ReactNode; style?: StyleProp<ViewStyle>; accent?: string }

/** Base surface. `accent` draws the coloured top edge that curves into the corners. */
export function Card({ children, style, accent }: Props) {
  return <View style={[styles.card, accent ? { borderTopWidth: 3, borderTopColor: accent } : null, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border, ...shadow },
});
