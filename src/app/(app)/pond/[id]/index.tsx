import { useEffect } from 'react';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PondDetailScreen } from '@/screens/pond-detail';
import { dailyLogRouteParams } from '@/screens/daily-log/route';

export default function PondDetailRoute() {
  const params = useLocalSearchParams<{ id?: string; tab?: string }>();
  const router = useRouter();
  const pondId = Number(params.id ?? 11);

  // ?tab= is a one-shot instruction from a flow that just saved (see the sell
  // route). Consume it and drop it, so a later manual tab change sticks and a
  // re-render can't yank the user back. Same pattern as Home's ?justSaved=.
  const focusTab = params.tab === 'cycles' || params.tab === 'history' ? params.tab : null;
  useEffect(() => {
    if (focusTab) router.setParams({ tab: undefined });
  }, [focusTab, router]);

  return (
    <ThemedSafeAreaView edges={['top']}>
      <PondDetailScreen
        pondId={pondId}
        focusTab={focusTab}
        onBack={() => router.back()}
        onDeleted={() => router.back()}
        onAction={(kind) => router.push(`/(app)/flows/${kind}?pondId=${pondId}`)}
        onOpenDailyLog={(target) =>
          router.push({
            pathname: '/(app)/daily-log',
            params: dailyLogRouteParams(target),
          })
        }
        onOpenLedger={() =>
          router.push({
            pathname: '/(app)/pond/[id]/ledger',
            params: { id: String(pondId) },
          })
        }
      />
    </ThemedSafeAreaView>
  );
}
