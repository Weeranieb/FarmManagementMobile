import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { HomeScreen, type HomeVariant, type SecondaryActionId } from '@/screens/home';
import type { ActivityItem } from '@/screens/home/components/activity-row';
import { space } from '@/theme/tokens';

const BOTTOM_CLEARANCE = space[10] + space[4];

const log = (...args: unknown[]) => console.log('[Home]', ...args);

/**
 * The Home redesign removes the floating action button entirely. The primary
 * action is now the Daily Log card; secondary fill/move/sell live inline as
 * equal-weight pills directly under the card. The just-saved state surfaces
 * via a floating toast and a "+N" chip on the primary card — both auto-
 * dismiss without taking the user out of context.
 */
export default function HomeRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTheme();
  const params = useLocalSearchParams<{ justSaved?: string }>();

  // Home opens on live data ('default'): the digest, today strip, pending list
  // and activity feed are all fetched from the API. The just-saved framing
  // (+N pill on the card + floating "บันทึกแล้ว" toast) is now reached only
  // after a real Daily Log save navigates here with ?justSaved=N — see below.
  const [variant, setVariant] = useState<HomeVariant>('default');
  const [justSavedCount, setJustSavedCount] = useState(0);
  // Toast visibility is tracked separately so dismissing the toast doesn't
  // collapse the rest of the just-saved state (+N pill, filtered pending list).
  const [savedToastVisible, setSavedToastVisible] = useState(false);

  // Honour ?justSaved=N — set after a Daily Log save navigation.
  useEffect(() => {
    const n = Number(params.justSaved ?? '');
    if (!Number.isFinite(n) || n <= 0) return;
    log('justSaved arrival', { count: n });
    setJustSavedCount(n);
    setVariant('justSaved');
    setSavedToastVisible(true);
    router.setParams({ justSaved: undefined });
  }, [params.justSaved, router]);

  useEffect(() => {
    log('mount HomeRoute', { insetsTop: insets.top });
    return () => log('unmount HomeRoute');
  }, [insets.top]);

  const onOpenDailyLog = useCallback(
    (pondId?: number) => {
      log('openDailyLog', { pondId });
      router.push(pondId ? `/(app)/daily-log?pondId=${pondId}` : '/(app)/daily-log');
    },
    [router],
  );

  const onOpenSecondaryAction = useCallback(
    (id: SecondaryActionId) => {
      log('secondary action picked', id);
      router.push(`/(app)/flows/${id}` as never);
    },
    [router],
  );

  const onOpenActivity = useCallback(
    (e: ActivityItem) => {
      log('openActivity', { id: e.id, recordType: e.recordType, recordId: e.recordId });
      // Phase 1 only has detail routes for fill/move/sell flows; daily-log
      // tap routes to the daily-log screen for the relevant pond.
      if (e.recordType === 'dailyLog') {
        router.push('/(app)/daily-log');
        return;
      }
      if (!e.recordType) return;
      router.push(`/(app)/flows/${e.recordType}` as never);
    },
    [router],
  );

  const onCreateFarm = useCallback(() => {
    log('create farm tapped');
    router.push('/(app)/farm' as never);
  }, [router]);

  const onSeeHistory = useCallback(() => {
    log('see history tapped');
    router.push('/(app)/activity-history' as never);
  }, [router]);

  const onPressProfile = useCallback(() => {
    log('profile avatar tapped');
    // navigate (not push) so we switch to the Profile tab rather than stacking
    // a second copy of it on top of Home.
    router.navigate('/(app)/(tabs)/profile');
  }, [router]);

  const onPressSavedToast = useCallback(() => {
    log('savedToast pressed → scroll to activity (placeholder)');
    setSavedToastVisible(false);
  }, []);

  const onDismissSavedToast = useCallback(() => {
    log('savedToast auto-dismissed');
    setSavedToastVisible(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <HomeScreen
        variant={variant}
        justSavedCount={justSavedCount}
        showSavedToast={savedToastVisible}
        bottomClearance={BOTTOM_CLEARANCE}
        onOpenDailyLog={onOpenDailyLog}
        onOpenSecondaryAction={onOpenSecondaryAction}
        onOpenActivity={onOpenActivity}
        onCreateFarm={onCreateFarm}
        onPressSavedToast={onPressSavedToast}
        onDismissSavedToast={onDismissSavedToast}
        onSeeHistory={onSeeHistory}
        onPressProfile={onPressProfile}
      />
    </View>
  );
}
