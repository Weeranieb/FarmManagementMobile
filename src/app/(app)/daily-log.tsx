import { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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

  // Native-stack (react-native-screens) resets the safe-area context to 0 for
  // the first frames of the slide-in transition, so a plain SafeAreaView would
  // render the header flush under the status bar until it settles. Fall back to
  // the static `initialWindowMetrics` — read synchronously at launch and immune
  // to that transition reset — so the top inset is correct from the first frame.
  const topInset = Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0);
  const bottomInset = Math.max(insets.bottom, initialWindowMetrics?.insets.bottom ?? 0);

  return (
    <View style={{ flex: 1, backgroundColor: t.surface, paddingTop: topInset }}>
      <DailyLogErrorBoundary>
        <DailyLogScreen
          farmId={farmId}
          initialPondId={initialPondId}
          onBack={() => router.back()}
          bottomInset={bottomInset}
        />
      </DailyLogErrorBoundary>
    </View>
  );
}
