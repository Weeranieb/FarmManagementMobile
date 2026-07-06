// eslint-disable-next-line import/no-duplicates
import 'react-native-gesture-handler';
import '../../global.css';
import '@/locale/i18n';

import { useEffect } from 'react';
// eslint-disable-next-line import/no-duplicates
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  Slot,
  SplashScreen,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { View } from 'react-native';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useAppFonts } from '@/theme/useAppFonts';
import { useAuthStore } from '@/features/auth';
import { restoreSavedLanguage } from '@/screens/language';
import { mmkvPersistStorage } from '@/lib/mmkv';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Read-mostly farm data: stay fresh for 5 min so navigation doesn't
      // trigger refetch churn. Queries needing tighter freshness (e.g. the
      // daily-log grid) set their own shorter staleTime.
      staleTime: 5 * 60_000,
      // Keep inactive data cached — and on disk (below) — for a day so cold
      // starts and tab revisits paint instantly, then revalidate in background.
      // Must be >= the persister maxAge for restored queries to survive.
      gcTime: 24 * 60 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Persist the query cache to MMKV so a cold start renders the last-known farm
// data immediately (offline-friendly), then revalidates. Non-sensitive only —
// secrets live in expo-secure-store, not here.
const persister = createSyncStoragePersister({
  storage: mmkvPersistStorage,
  key: 'farmos-rq-cache',
});

function RootShell({ children }: { children: React.ReactNode }) {
  const { t, mode } = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(t.bg);
  }, [t.bg]);

  const statusBarStyle = mode === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={statusBarStyle} translucent backgroundColor="transparent" />
      {children}
    </View>
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();
  const ready = useAuthStore((s) => s.ready);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!navState?.key) return;
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(app)/(tabs)/home');
    }
  }, [navState?.key, ready, token, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const { loaded: fontsLoaded } = useAppFonts();
  const hydrate = useAuthStore((s) => s.hydrate);
  const ready = useAuthStore((s) => s.ready);

  useEffect(() => {
    void hydrate();
    void restoreSavedLanguage();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && ready) void SplashScreen.hideAsync();
  }, [fontsLoaded, ready]);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          // Discard cache older than a day; bump `buster` when a cached query's
          // shape changes so stale disk data is thrown away on the next launch.
          maxAge: 24 * 60 * 60_000,
          buster: 'v1',
        }}
      >
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootShell>
              <AuthGate />
            </RootShell>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
