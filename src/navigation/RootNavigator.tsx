import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, font, radius, spacing } from '../theme';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Central icon config: adding a new tab only requires an entry here. */
const TAB_ICONS: Record<
  keyof RootTabParamList,
  { active: IconName; inactive: IconName; label: string }
> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline', label: 'Dashboard' },
  Analytics: {
    active: 'stats-chart',
    inactive: 'stats-chart-outline',
    label: 'Analytics',
  },
  Alerts: {
    active: 'notifications',
    inactive: 'notifications-outline',
    label: 'Alerts',
  },
  Profile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

function TabBarIcon({
  name,
  focused,
  color,
}: {
  name: keyof RootTabParamList;
  focused: boolean;
  color: string;
}) {
  const cfg = TAB_ICONS[name];
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? cfg.active : cfg.inactive}
        size={22}
        color={color}
      />
    </View>
  );
}

function Tabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          { height: tabBarHeight, paddingBottom: Math.max(insets.bottom, 8) },
        ],
        tabBarIcon: ({ focused, color }) => (
          <TabBarIcon name={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarBadge: 3,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    shadowColor: '#0E1E35',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: font.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
  badge: {
    backgroundColor: colors.negative,
    fontSize: 9,
    fontWeight: '800',
    minWidth: 16,
    height: 16,
  },
});
