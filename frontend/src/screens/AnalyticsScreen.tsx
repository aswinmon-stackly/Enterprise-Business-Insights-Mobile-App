import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BreakdownBars } from '../components/BreakdownBars';
import { PeriodSelector } from '../components/PeriodSelector';
import { RevenueOverview } from '../components/RevenueOverview';
import { ScreenContainer } from '../components/ScreenContainer';
import { TopProductsList } from '../components/TopProductsList';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { colors, font } from '../theme';
import { AnalyticsPeriod } from '../types';

const PERIODS = ['7D', '30D', '90D'] as const satisfies readonly AnalyticsPeriod[];

export function AnalyticsScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7D');
  const { data, loading, refreshing, error, refresh } = useAnalyticsData(period);

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">Analytics</Text>
        <Text style={styles.subtitle}>Performance by period, category and region</Text>
      </View>
      <PeriodSelector options={PERIODS} value={period} onChange={setPeriod} />

      {!data ? (
        error
          ? <Text style={styles.error}>{error}. Pull down to retry.</Text>
          : <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <View style={[styles.body, loading && styles.dim]}>
          <RevenueOverview data={data} />
          <BreakdownBars title="Revenue by category" items={data.categories} />
          <BreakdownBars title="Regional performance" items={data.regions} color={colors.teal} />
          <TopProductsList title="Top products" items={data.topProducts} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  head: { gap: 2 },
  title: { fontSize: font.h1 + 4, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: font.body, color: colors.inkMuted },
  body: { gap: 12 },
  dim: { opacity: 0.5 },
  center: { paddingVertical: 60, alignItems: 'center' },
  error: { color: colors.negative, textAlign: 'center', marginTop: 40 },
});
