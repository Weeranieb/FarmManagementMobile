import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { ActivityHistoryScreen } from '@/screens/activity-history';
import type { ActivityItem } from '@/screens/home/components/activity-row';
import { space } from '@/theme/tokens';

const log = (...args: unknown[]) => console.log('[ActivityHistory]', ...args);

export default function ActivityHistoryRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  }, [router]);

  // Same routing rule as the Home feed: rows deep-link to the source record
  // class. Phase 1 has flow screens for fill/move/sell.
  const onOpenActivity = useCallback(
    (e: ActivityItem) => {
      log('openActivity', { id: e.id, recordType: e.recordType, recordId: e.recordId });
      if (e.recordType === 'fill' || e.recordType === 'move' || e.recordType === 'sell') {
        router.push(`/(app)/flows/${e.recordType}` as never);
      }
    },
    [router],
  );

  return (
    <ThemedSafeAreaView edges={['top']}>
      <ActivityHistoryScreen
        bottomClearance={insets.bottom + space[6]}
        onBack={onBack}
        onOpenActivity={onOpenActivity}
      />
    </ThemedSafeAreaView>
  );
}
