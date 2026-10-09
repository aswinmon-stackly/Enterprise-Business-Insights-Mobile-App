import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo's Babel preset inlines process.env.EXPO_PUBLIC_* at build time; declared locally so typing
// doesn't depend on @types/node (module-scoped, so it can't clash with Expo's own declarations).
declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

const API_PORT = 8000;

/**
 * Resolution order:
 * 1. EXPO_PUBLIC_API_URL (see .env.example), e.g. http://192.168.0.101:8000
 * 2. The same machine Expo is served from (works for a physical phone on the same Wi-Fi)
 * 3. Emulator/browser fallbacks
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;
  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
