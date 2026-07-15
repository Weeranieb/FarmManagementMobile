import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { activityKeys, useActivityFeedData } from '@/features/activity';
import { farmKeys } from '@/features/farm';
import { pondKeys } from '@/features/pond';
import { thaiDate } from '@/locale/thaiDate';
import { log, type HomeDigest } from './constants';
import { useHomeDigest } from './useHomeDigest';
import { toActivityItem, type ActivityItem } from './components/activity-row';

// How many recent events the Home strip shows (matches the design's 6-row cap).
const HOME_ACTIVITY_LIMIT = 6;

/** Home-strip label: relative day ("เมื่อวาน", "5 วันก่อน") + the saved clock
 *  time when the record was logged on the event day. Mirrors the design's
 *  "เมื่อวาน 16:00" style. The adapter's `whenLabel` is "HH:mm น." for same-day
 *  saves and "บันทึกย้อนหลัง" for backdated ones — we reuse it to decide. */
function homeWhenLabel(dateKey: string, adapterLabel: string): string {
  const rel = thaiDate.ago(new Date(`${dateKey}T00:00:00`));
  const timeMatch = adapterLabel.match(/\d{1,2}:\d{2}/);
  return timeMatch ? `${rel} ${timeMatch[0]}` : rel;
}

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
  /** Recent-activity feed is loading (independent of the demo `loading` variant). */
  activityLoading: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  isJustSaved: boolean;
};

export function useHomeScreen({ variant, justSavedCount = 0 }: HookProps): HomeState {
  const [refreshing, setRefreshing] = useState(false);
  const authUser = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const greetingName = authUser?.firstName?.trim() || 'ผู้ใช้';
  const displayInitial = greetingName.trim().slice(0, 1);

  // Digest is now live (GET /farm → /pond → /pond/:id/daily-logs). `variant`
  // still forces loading/empty for storybook + tests; in the app the route
  // mounts with variant='default' and the live hook decides those states.
  const live = useHomeDigest();
  const isJustSaved = variant === 'justSaved';
  const isLoading = variant === 'loading' || live.isLoading;
  const isEmpty = variant === 'empty' || live.isEmpty;

  const digest = isLoading || isEmpty ? null : live.digest;

  // Recent activity is live (same GET /activity feed as the full ประวัติกิจกรรม
  // screen), capped to the newest few. The digest card + today strip above are
  // now live too (see useHomeDigest).
  const feed = useActivityFeedData(HOME_ACTIVITY_LIMIT);
  const me = authUser?.username;
  const activity = useMemo<ActivityItem[]>(() => {
    if (isEmpty) return [];
    return feed.data.slice(0, HOME_ACTIVITY_LIMIT).map((m) => ({
      ...toActivityItem(m, me),
      whenLabel: homeWhenLabel(m.dateKey, m.whenLabel),
    }));
  }, [feed.data, me, isEmpty]);

  // Show the activity skeleton for the demo `loading` variant OR while the
  // real feed is in flight.
  const activityLoading = !isEmpty && (isLoading || feed.isLoading);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh every source the screen reads: farms + ponds drive the digest
      // header/stats, daily-logs drive progress/feed/deaths, activity the feed.
      await Promise.all([
        qc.invalidateQueries({ queryKey: farmKeys.all() }),
        qc.invalidateQueries({ queryKey: pondKeys.all() }),
        // dailyLogKeys are ['dailyLog', pondId, month]; the bare prefix matches
        // every pond/month query at once.
        qc.invalidateQueries({ queryKey: ['dailyLog'] }),
        qc.invalidateQueries({ queryKey: activityKeys.all() }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [qc]);

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
    activityLoading,
    isLoading,
    isEmpty,
    isJustSaved,
  };
}
