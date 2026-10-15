import { AlertsScreen } from "../screens/AlertsScreen";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export const routes = [
  {
    name: "Dashboard",
    component: DashboardScreen,
    icon: {
      active: "grid",
      inactive: "grid-outline",
    },
  },
  {
    name: "Analytics",
    component: AnalyticsScreen,
    icon: {
      active: "stats-chart",
      inactive: "stats-chart-outline",
    },
  },
  {
    name: "Alerts",
    component: AlertsScreen,
    icon: {
      active: "notifications",
      inactive: "notifications-outline",
    },
    badge: 3,
  },
  {
    name: "Profile",
    component: ProfileScreen,
    icon: {
      active: "person",
      inactive: "person-outline",
    },
  },
] as const;
