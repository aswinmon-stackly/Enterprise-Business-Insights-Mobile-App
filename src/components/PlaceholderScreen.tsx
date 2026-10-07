import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';
import { ScreenContainer } from './ScreenContainer';

interface Props {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

export function PlaceholderScreen({ title, description, icon }: Props) {
  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={40} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Coming Soon</Text>
        <Text style={styles.desc}>{description}</Text>
        <View style={styles.pillRow}>
          {/* <View style={styles.pill}>
            <View style={[styles.pillDot, { backgroundColor: colors.primaryLight }]} />
            <Text style={styles.pillText}>Powered by FastAPI</Text>
          </View> */}
          {/* <View style={styles.pill}>
            <View style={[styles.pillDot, { backgroundColor: colors.teal }]} />
            <Text style={styles.pillText}>Real-time data</Text>
          </View> */}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: font.hero,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: 80,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primarySoft,
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: font.h1,
    fontWeight: '800',
    color: colors.ink,
  },
  desc: {
    fontSize: font.body,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: {
    fontSize: font.captionMd,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
