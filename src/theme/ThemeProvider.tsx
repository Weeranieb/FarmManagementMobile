import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { themes, type ThemeMode, type ThemePalette } from './tokens';
import { shadow, shadowLg, shadowXl } from './shadows';
import type { ViewStyle } from 'react-native';

type ThemeCtx = {
  t: ThemePalette;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  shadow: ViewStyle;
  shadowLg: ViewStyle;
  shadowXl: ViewStyle;
};

const STORAGE_KEY = 'farmos.theme.mode';

const Ctx = createContext<ThemeCtx | null>(null);

type Props = {
  initialMode?: ThemeMode;
  children: React.ReactNode;
};

export function ThemeProvider({ initialMode = 'light', children }: Props) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'outdoor') {
          setModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    SecureStore.setItemAsync(STORAGE_KEY, m).catch(() => {});
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({
      t: themes[mode],
      mode,
      setMode,
      shadow: shadow(mode),
      shadowLg: shadowLg(mode),
      shadowXl: shadowXl(mode),
    }),
    [mode, setMode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
