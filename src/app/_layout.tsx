// eslint-disable-next-line import/no-duplicates
import 'react-native-gesture-handler';
import '../../global.css';
import '@/locale/i18n';

import { useCallback, useEffect, useRef } from 'react';
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
import { startNetworkWatcher } from '@/lib/network';
import { OfflineBanner } from '@/components/ui';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

void SplashScreen.preventAutoHideAsync().catch(() => {});

// Teach React Query about connectivity before the first query mounts, so a cold
// start out of signal pauses fetches instead of firing them into a dead socket.
startNetworkWatcher();

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      // Fire writes even when `onlineManager` says we're offline. The default
      // ('online') *pauses* the mutation instead: `mutateAsync` never settles,
      // which would leave the daily-log / ledger save stuck behind a spinner
      // with no way to tell the user anything. Failing fast is what lets those
      // screens say "no signal — kept on this phone" while the persisted drafts
      // (features/daily-log/drafts.ts) hold the data until the next attempt.
      networkMode: 'always',
    },
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

function RootShell({
  children,
  onLayout,
}: {
  children: React.ReactNode;
  /** Fires once, on this view's first layout pass — see RootLayout for why
   *  the native splash is hidden from here rather than from a plain effect. */
  onLayout?: () => void;
}) {
  const { t, mode } = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(t.bg);
  }, [t.bg]);

  const statusBarStyle = mode === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }} onLayout={onLayout}>
      <StatusBar style={statusBarStyle} translucent backgroundColor="transparent" />
      {/* Screens get the flexible box; the offline strip is laid out under them
          so it can never overlap a tab bar, save bar or table row. */}
      <View style={{ flex: 1 }}>{children}</View>
      <OfflineBanner />
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
  const appReady = fontsLoaded && ready;

  useEffect(() => {
    void hydrate();
    void restoreSavedLanguage();
  }, [hydrate]);

  // Hide the native splash from the real content's own first `onLayout`
  // instead of a bare effect keyed on `appReady`. `AuthGate`/`RootShell`
  // aren't mounted until `appReady` is true (see below), so this fires the
  // instant the app's actual UI has been laid out — not merely the instant
  // React state flipped, which on Android could race the native splash's
  // own dismiss/exit-animation and leave its icon visible over content that
  // had already painted underneath it.
  const hiddenRef = useRef(false);
  const handleContentLayout = useCallback(() => {
    if (hiddenRef.current) return;
    hiddenRef.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

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
            {appReady ? (
              <RootShell onLayout={handleContentLayout}>
                <AppErrorBoundary>
                  <AuthGate />
                </AppErrorBoundary>
              </RootShell>
            ) : null}
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
