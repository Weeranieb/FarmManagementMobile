import { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { DailyLogScreen } from '@/screens/daily-log';
import { DailyLogErrorBoundary } from '@/screens/daily-log/ErrorBoundary';
import { useTheme } from '@/theme/ThemeProvider';

function parseRouteId(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export default function DailyLogRoute() {
  const router = useRouter();
  const { t } = useTheme();
  const params = useLocalSearchParams<{ farmId?: string; pondId?: string }>();
  const farmId = parseRouteId(params.farmId);
  const initialPondId = parseRouteId(params.pondId);

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
        <DailyLogScreen
          farmId={farmId}
          initialPondId={initialPondId}
          onBack={() => router.back()}
        />
      </DailyLogErrorBoundary>
    </ThemedSafeAreaView>
  );
}
