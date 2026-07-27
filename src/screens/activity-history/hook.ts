import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/features/auth';
import { adaptActivityFeedItem, useActivityFeedPages } from '@/features/activity';
import { thaiDate } from '@/locale/thaiDate';
import { today } from '@/shared/time';
import type { ActivityItem, ActivityKind } from '@/screens/home/components/activity-row';
import { toActivityItem } from '@/screens/home/components/activity-row';
import { FILTERS, log, type FilterId } from './constants';

export type DayGroupModel = {
  dateKey: string;
  /** "วันนี้" / "เมื่อวาน" / "ศ 1 พ.ค. 69" */
  heading: string;
  items: ActivityItem[];
};

export type ActivityHistoryState = {
  isLoading: boolean;
  /** No events at all (brand-new farm) — also the fallback when the feed
   *  errors, matching how sibling screens degrade. */
  isEmpty: boolean;
  /** The active filter matched nothing (but events exist). */
  filteredEmpty: boolean;
  filter: FilterId;
  setFilter: (id: FilterId) => void;
  counts: Record<FilterId, number>;
  filteredCount: number;
  groups: DayGroupModel[];
  refreshing: boolean;
  onRefresh: () => void;
  /** More pages exist on the server. While true every count on this screen is a
   *  count of what has loaded, not a total — the UI must not present them as
   *  final, and must not disable a filter just because its count is 0. */
  hasMore: boolean;
  /** A next-page request is in flight (footer spinner). */
  loadingMore: boolean;
  /** Fetches the next page; safe to call repeatedly while scrolling. */
  onEndReached: () => void;
};

function dayHeading(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((t0.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'วันนี้';
  if (diff === 1) return 'เมื่อวาน';
  return `${thaiDate.weekdayShort(d.getDay())} ${thaiDate.short(d)}`;
}

export function useActivityHistoryScreen(): ActivityHistoryState {
  const enabled = useIsAuthenticated();
  const q = useActivityFeedPages();
  const me = useAuthStore((s) => s.user?.username);
  const [filter, setFilter] = useState<FilterId>('all');
  const [refreshing, setRefreshing] = useState(false);

  // A disabled (signed-out) query stays pending forever — don't show the
  // skeleton for it; fall through to the empty state instead.
  const isLoading = enabled && q.isPending;

  // ActivityRow-ready items, newest first (server order).
  const rows = useMemo(() => {
    const raw = q.data?.pages.flat() ?? [];
    return raw.map((item) => {
      const e = adaptActivityFeedItem(item);
      return { ...toActivityItem(e, me), dateKey: e.dateKey };
    });
  }, [q.data, me]);

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = {
      all: rows.length,
      feed: 0,
      fill: 0,
      move: 0,
      sell: 0,
      buy: 0,
    };
    for (const r of rows) c[r.kind] += 1;
    return c;
  }, [rows]);

  const filtered = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.kind === (filter as ActivityKind))),
    [rows, filter],
  );

  const groups = useMemo<DayGroupModel[]>(() => {
    const out: DayGroupModel[] = [];
    const byDate = new Map<string, DayGroupModel>();
    for (const r of filtered) {
      let group = byDate.get(r.dateKey);
      if (!group) {
        group = { dateKey: r.dateKey, heading: dayHeading(r.dateKey), items: [] };
        byDate.set(r.dateKey, group);
        out.push(group);
      }
      group.items.push(r);
    }
    return out;
  }, [filtered]);

  const isEmpty = !isLoading && rows.length === 0;
  // "This filter matches nothing" is only true once there is nothing left to
  // load. Declaring it while pages remain would strand the user on an empty
  // state whose matches are simply further down the list.
  const filteredEmpty = !isLoading && !isEmpty && filtered.length === 0 && !q.hasNextPage;

  const hasMore = q.hasNextPage;

  // FlashList fires onEndReached repeatedly while the tail stays visible; the
  // guards keep that from queueing duplicate page requests.
  const onEndReached = useCallback(() => {
    if (!q.hasNextPage || q.isFetchingNextPage) return;
    void q.fetchNextPage();
  }, [q]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // refetch() on an infinite query re-requests every loaded page in
      // sequence. That is what we want: a pull-to-refresh after scrolling deep
      // should not silently drop the user back to page 1.
      await q.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [q]);

  // Filtering happens client-side over loaded rows, so a narrow filter can hit
  // a run of non-matching pages. Keep pulling while it matches nothing: this
  // converges (each page consumes history) and is what makes the empty state
  // above trustworthy.
  useEffect(() => {
    if (filter === 'all' || filtered.length > 0) return;
    if (!q.hasNextPage || q.isFetchingNextPage) return;
    void q.fetchNextPage();
  }, [filter, filtered.length, q]);

  useEffect(() => {
    if (q.isError) log('feed query failed — showing empty state', q.error);
  }, [q.isError, q.error]);

  useEffect(() => {
    log('ActivityHistory state', {
      isLoading,
      isEmpty,
      filteredEmpty,
      filter,
      counts,
      groups: groups.length,
    });
  }, [isLoading, isEmpty, filteredEmpty, filter, counts, groups.length]);

  return {
    isLoading,
    isEmpty,
    filteredEmpty,
    filter,
    setFilter,
    counts,
    filteredCount: filtered.length,
    groups,
    refreshing,
    onRefresh,
    hasMore,
    loadingMore: q.isFetchingNextPage,
    onEndReached,
  };
}

export { FILTERS };
