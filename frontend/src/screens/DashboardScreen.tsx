import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ActivityList } from '../components/ActivityList';
import { AnalyticsPreview } from '../components/AnalyticsPreview';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { ErrorState } from '../components/ErrorState';
import { KpiGrid } from '../components/KpiGrid';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionHeader } from '../components/SectionHeader';
import { useDashboardData } from '../hooks/useDashboardData';
import { RootTabParamList } from '../navigation/types';
import { greeting } from '../utils/format';

type Props = BottomTabScreenProps<RootTabParamList, 'Dashboard'>;

/** No fetch() here: the screen only reads state from the hook and renders reusable components. */
export function DashboardScreen({ navigation }: Props) {
  const { data, loading, refreshing, error, refresh, retry } = useDashboardData();

  if (loading && !data) {
    return <ScreenContainer scroll={false}><DashboardSkeleton /></ScreenContainer>;
  }
  if (!data) {
    // Failed with nothing to show. Still pull-to-refreshable.
    return (
      <ScreenContainer refreshing={refreshing} onRefresh={refresh}>
        <ErrorState message={error ?? 'Something went wrong.'} onRetry={retry} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={refresh}>
      {error ? <ErrorState compact message={error} onRetry={retry} /> : null}
      <DashboardHeader
        greeting={greeting()}
        userName={data.user.name}
        unreadCount={data.unreadNotifications}
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => navigation.navigate('Alerts')}
      />
      <KpiGrid kpis={data.kpis} />
      <View style={styles.section}>
        <SectionHeader title="Analytics" actionLabel="View all" onActionPress={() => navigation.navigate('Analytics')} />
        <AnalyticsPreview revenueTrend={data.revenueTrend} salesSummary={data.salesSummary} topCategory={data.topCategory} />
      </View>
      <View style={styles.section}>
        <SectionHeader title="Recent Activity" />
        <ActivityList items={data.activities} />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({ section: { gap: 8 } });
