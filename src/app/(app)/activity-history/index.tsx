import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { ActivityHistoryScreen } from '@/screens/activity-history';
import { space } from '@/theme/tokens';

export default function ActivityHistoryRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/home');
  }, [router]);

  // Rows open the read-only record sheet in-place (owned by the screen) rather
  // than routing anywhere — see components/activity/ActivityDetailSheet.
  return (
    <ThemedSafeAreaView edges={['top']}>
      <ActivityHistoryScreen bottomClearance={insets.bottom + space[6]} onBack={onBack} />
    </ThemedSafeAreaView>
  );
}
