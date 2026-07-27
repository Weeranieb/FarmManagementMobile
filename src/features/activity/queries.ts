import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { listActivityFeed, listActivityFeedPage, listActivitySellDetails } from './service';
import type { ActivityFeedCursor } from './service';
import { adaptActivityFeedItem, type ActivityEventModel } from './adapters';
import type { SellDetailLine } from './types';

export const activityKeys = {
  all: () => ['activity'] as const,
  feed: (limit?: number) =>
    limit && limit > 0 ? (['activity', 'feed', limit] as const) : (['activity', 'feed'] as const),
  feedPages: (pageSize: number) => ['activity', 'feedPages', pageSize] as const,
  sellDetails: (activityId: number) => ['activity', 'sellDetails', activityId] as const,
} as const;

/** Rows per page on the history screen. Big enough to fill a tall phone twice
 *  over, so the first page almost always covers what the user came to see. */
export const FEED_PAGE_SIZE = 30;

export function useActivityFeed(limit?: number) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: activityKeys.feed(limit),
    queryFn: () => listActivityFeed(limit),
    enabled,
  });
}

/**
 * The full history, one page at a time — the ประวัติกิจกรรม screen.
 *
 * Replaces an unbounded `GET /activity` that returned every activity the client
 * had ever recorded, in one response, and then persisted the lot to MMKV. That
 * cost grew forever with no ceiling.
 *
 * End-of-list is inferred from a short page rather than a server flag, so a
 * history whose size is an exact multiple of the page size costs one extra
 * request that comes back empty. That is the whole price of keeping the
 * endpoint's array response unchanged for the Home strip.
 */
export function useActivityFeedPages(pageSize: number = FEED_PAGE_SIZE) {
  const enabled = useIsAuthenticated();
  return useInfiniteQuery({
    queryKey: activityKeys.feedPages(pageSize),
    queryFn: ({ pageParam }) => listActivityFeedPage(pageSize, pageParam),
    initialPageParam: null as ActivityFeedCursor | null,
    getNextPageParam: (lastPage): ActivityFeedCursor | null => {
      if (!Array.isArray(lastPage) || lastPage.length < pageSize) return null;
      const last = lastPage[lastPage.length - 1];
      return last ? { activityDate: last.activityDate, id: last.id } : null;
    },
    enabled,
  });
}

/**
 * One sale's size-grade breakdown. `activityId` is null for non-sell records,
 * which keeps the query disabled — the detail sheet renders every kind, and
 * only a sale has grade lines to fetch.
 *
 * A sale's lines are immutable once written (there is no edit path), so this
 * never needs refetching within a session.
 */
export function useActivitySellDetails(activityId: number | null) {
  const authed = useIsAuthenticated();
  return useQuery({
    queryKey: activityKeys.sellDetails(activityId ?? 0),
    queryFn: () => listActivitySellDetails(activityId as number),
    enabled: authed && activityId != null,
    staleTime: Infinity,
  });
}

export function useActivitySellDetailsData(activityId: number | null): DataState<SellDetailLine[]> {
  const q = useActivitySellDetails(activityId);
  if (activityId == null) return { data: [], isLoading: false, isError: false };
  if (q.isPending) return { data: [], isLoading: true, isError: false };
  if (q.isError || !Array.isArray(q.data)) return { data: [], isLoading: false, isError: true };
  return { data: q.data, isLoading: false, isError: false };
}

type DataState<T> = { data: T; isLoading: boolean; isError: boolean };

export function useActivityFeedData(limit?: number): DataState<ActivityEventModel[]> {
  const enabled = useIsAuthenticated();
  const q = useActivityFeed(limit);

  if (!enabled) {
    return { data: [], isLoading: false, isError: true };
  }
  if (q.isPending) {
    return { data: [], isLoading: true, isError: false };
  }
  if (q.isError || !Array.isArray(q.data)) {
    return { data: [], isLoading: false, isError: true };
  }
  return { data: q.data.map(adaptActivityFeedItem), isLoading: false, isError: false };
}
