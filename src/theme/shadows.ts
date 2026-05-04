// React Native doesn't accept CSS box-shadow strings. The tokens carry the
// CSS form for documentation; here we map theme `shadow` and `shadowLg` to
// platform-appropriate ViewStyle objects.

import type { ViewStyle } from 'react-native';
import type { ThemeMode } from './tokens';

const sm = {
  shadowColor: '#0a0e14',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 1,
} as const;

const lg = {
  shadowColor: '#0a0e14',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 4,
} as const;

const smDark = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.4,
  shadowRadius: 6,
  elevation: 2,
} as const;

const lgDark = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.5,
  shadowRadius: 18,
  elevation: 6,
} as const;

export function shadow(mode: ThemeMode): ViewStyle {
  return mode === 'dark' ? smDark : sm;
}
export function shadowLg(mode: ThemeMode): ViewStyle {
  return mode === 'dark' ? lgDark : lg;
}
