import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { DailyLogScreen } from '@/screens/daily-log';
import { DailyLogErrorBoundary } from '@/screens/daily-log/ErrorBoundary';
import { useTheme } from '@/theme/ThemeProvider';

export default function DailyLogRoute() {
  const router = useRouter();
  const { t } = useTheme();

  // Root shell uses `t.bg` for SystemUI; match white chrome while this screen is focused.
  useFocusEffect(
    useCallback(() => {
      void SystemUI.setBackgroundColorAsync(t.surface);
      return () => {
        void SystemUI.setBackgroundColorAsync(t.bg);
      };
    }, [t.surface, t.bg]),
  );

  return (
    <ThemedSafeAreaView edges={['top']} canvas="surface">
      <DailyLogErrorBoundary>
        <DailyLogScreen onBack={() => router.back()} />
      </DailyLogErrorBoundary>
    </ThemedSafeAreaView>
  );
}
