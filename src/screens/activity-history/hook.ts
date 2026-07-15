import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/features/auth';
import { adaptActivityFeedItem, useActivityFeed } from '@/features/activity';
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
  const q = useActivityFeed();
  const me = useAuthStore((s) => s.user?.username);
  const [filter, setFilter] = useState<FilterId>('all');
  const [refreshing, setRefreshing] = useState(false);

  // A disabled (signed-out) query stays pending forever — don't show the
  // skeleton for it; fall through to the empty state instead.
  const isLoading = enabled && q.isPending;

  // ActivityRow-ready items, newest first (server order).
  const rows = useMemo(() => {
    const raw = Array.isArray(q.data) ? q.data : [];
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
  const filteredEmpty = !isLoading && !isEmpty && filtered.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await q.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [q]);

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
  };
}

export { FILTERS };
