import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ActivityList } from '../components/ActivityList';
import { AnalyticsPreview } from '../components/AnalyticsPreview';
import { DashboardHeader } from '../components/DashboardHeader';
import { KpiGrid } from '../components/KpiGrid';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionHeader } from '../components/SectionHeader';
import { useDashboardData } from '../hooks/useDashboardData';
import { RootTabParamList } from '../navigation/types';
import { colors } from '../theme';
import { greeting } from '../utils/format';

type Props = BottomTabScreenProps<RootTabParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { data, loading, refreshing, error, refresh } = useDashboardData();

  if (loading && !data) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
        <Text style={styles.error}>{error ?? 'No data available'}. Pull down to retry.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={refresh}>
      {/* Header */}
      <DashboardHeader
        greeting={greeting()}
        userName={data.user.name}
        role={data.user.role}
        unreadCount={data.unreadNotifications}
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => navigation.navigate('Alerts')}
      />

      {/* KPI Cards */}
      <KpiGrid kpis={data.kpis} />

      {/* Analytics Preview */}
      <View style={styles.section}>
        <SectionHeader
          title="Analytics"
          actionLabel="View all"
          onActionPress={() => navigation.navigate('Analytics')}
        />
        <AnalyticsPreview
          revenueTrend={data.revenueTrend}
          salesSummary={data.salesSummary}
          topCategory={data.topCategory}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <SectionHeader title="Recent Activity" />
        <ActivityList items={data.activities} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.negative, textAlign: 'center', marginTop: 40, lineHeight: 22 },
});
