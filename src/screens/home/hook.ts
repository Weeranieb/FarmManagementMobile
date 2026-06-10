import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  HOME_ACTIVITY,
  HOME_DIGEST_DEFAULT,
  HOME_DIGEST_JUST_SAVED,
  log,
  type HomeDigest,
} from './constants';
import type { ActivityItem } from './components/activity-row';

export type HomeVariant = 'loading' | 'empty' | 'default' | 'justSaved';

type HookProps = {
  variant: HomeVariant;
  justSavedCount?: number;
};

type HomeState = {
  refreshing: boolean;
  onRefresh: () => void;
  greetingName: string;
  displayInitial: string;
  digest: HomeDigest | null;
  activity: ActivityItem[];
  isLoading: boolean;
  isEmpty: boolean;
  isJustSaved: boolean;
};

export function useHomeScreen({ variant, justSavedCount = 0 }: HookProps): HomeState {
  const [refreshing, setRefreshing] = useState(false);
  const authUser = useAuthStore((s) => s.user);

  const greetingName = authUser?.firstName?.trim() || 'ผู้ใช้';
  const displayInitial = greetingName.trim().slice(0, 1);

  const isLoading = variant === 'loading';
  const isEmpty = variant === 'empty';
  const isJustSaved = variant === 'justSaved';

  const digest = isLoading || isEmpty ? null : isJustSaved ? HOME_DIGEST_JUST_SAVED : HOME_DIGEST_DEFAULT;
  const activity = isEmpty ? [] : HOME_ACTIVITY;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 700));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    log('HomeScreen mount', {
      variant,
      justSavedCount,
      authUser: authUser ? { id: authUser.id, firstName: authUser.firstName } : null,
      greetingName,
      counts: {
        activity: activity.length,
        pending: digest?.pending.length ?? 0,
        late: digest?.late.length ?? 0,
      },
    });
    return () => log('HomeScreen unmount');
    // Activity / digest are pure derivations of variant — including them
    // here would just re-fire on every render with the same content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, justSavedCount, authUser, greetingName]);

  return {
    refreshing,
    onRefresh,
    greetingName,
    displayInitial,
    digest,
    activity,
    isLoading,
    isEmpty,
    isJustSaved,
  };
}
