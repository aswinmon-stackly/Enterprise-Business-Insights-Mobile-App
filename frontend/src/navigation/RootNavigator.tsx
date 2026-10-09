import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Central config: adding a tab means one entry here; no UI component knows about routes.
const TAB_ICONS: Record<keyof RootTabParamList, { active: IconName; inactive: IconName }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Analytics: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Alerts: { active: 'notifications', inactive: 'notifications-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 58 + insets.bottom, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 6), borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarBadge: 3 }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return <NavigationContainer><Tabs /></NavigationContainer>;
}
