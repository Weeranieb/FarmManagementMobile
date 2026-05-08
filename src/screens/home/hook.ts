import { useCallback, useEffect, useState } from 'react';
import { mockProfile, useAuthStore } from '@/features/auth';
import { HOME_ALERTS, HOME_ACTIVITY, HOME_TASK, log } from './constants';

type HookProps = {
  isLoading: boolean;
  showHeader: boolean;
  fabClearance: number | undefined;
};

export function useHomeScreen({ isLoading, showHeader, fabClearance }: HookProps) {
  const [refreshing, setRefreshing] = useState(false);
  const authUser = useAuthStore((s) => s.user);
  const fallbackName = mockProfile.name.split(' ')[0] ?? mockProfile.name;
  const greetingName = authUser?.firstName?.trim() || fallbackName;
  const displayInitial = greetingName.trim().slice(0, 1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 700);
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    log('HomeScreen mount', {
      isLoading,
      showHeader,
      fabClearance,
      authUser: authUser ? { id: authUser.id, firstName: authUser.firstName } : null,
      greetingName,
      counts: {
        alerts: HOME_ALERTS.length,
        activity: HOME_ACTIVITY.length,
        taskPending: HOME_TASK.pending,
        taskLate: HOME_TASK.late,
      },
    });
    return () => log('HomeScreen unmount');
    // Run once per mount + when loading flag flips so we can see state
    // transitions during dev (skeleton -> real data).
  }, [isLoading, showHeader, fabClearance, authUser, greetingName]);

  return { refreshing, onRefresh, greetingName, displayInitial };
}
