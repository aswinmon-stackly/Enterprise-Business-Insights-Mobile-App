import { Platform, ViewStyle } from 'react-native';

export const colors = {
  bg: '#EFF2F9', surface: '#FFFFFF', ink: '#0F1B33', inkMuted: '#6B7690', border: '#E4E9F2', chip: '#F1F4FA',
  primary: '#2650A8', primaryDark: '#1B3A80', primarySoft: '#E8EEFB',
  teal: '#0F8F7A', tealSoft: '#DFF4EF',
  purple: '#7B5CD6', purpleSoft: '#EEE8FB',
  orange: '#D9760F', orangeSoft: '#FDF0E0',
  positive: '#12805C', positiveSoft: '#E3F5EC', negative: '#C0392B', negativeSoft: '#FBE9E6',
  amber: '#B7791F', amberSoft: '#FBF1DC',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 10, md: 18, lg: 24 } as const;
export const font = { caption: 12, body: 14, title: 16, h2: 18, h1: 22, kpi: 20 } as const;
export const MIN_TOUCH = 44; // minimum touch target (Apple HIG / Material)

/** Soft card elevation, per platform. */
export const shadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: { shadowColor: '#1B2B55', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    android: { elevation: 3 },
    default: { boxShadow: '0 6px 14px rgba(27,43,85,0.08)' },
  }) ?? {};
