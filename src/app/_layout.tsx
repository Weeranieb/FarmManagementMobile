// eslint-disable-next-line import/no-duplicates
import 'react-native-gesture-handler';
import '../../global.css';
import '@/locale/i18n';

import { useEffect } from 'react';
// eslint-disable-next-line import/no-duplicates
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { View } from 'react-native';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useAppFonts } from '@/theme/useAppFonts';
import { useAuthStore } from '@/features/auth';
import { restoreSavedLanguage } from '@/screens/language';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false },
  },
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
  const ready = useAuthStore((s) => s.ready);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(app)/(tabs)/home');
    }
  }, [ready, token, segments, router]);

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

  if (!fontsLoaded || !ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootShell>
              <AuthGate />
            </RootShell>
          </GestureHandlerRootView>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
