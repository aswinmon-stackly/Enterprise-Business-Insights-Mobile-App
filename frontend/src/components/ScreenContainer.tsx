import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface Props { children: React.ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void }

/** Handles safe area (top only; the tab bar handles bottom), scrolling and consistent gutters. */
export function ScreenContainer({ children, scroll = true, refreshing = false, onRefresh }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 1.5, gap: spacing.xl },
});
