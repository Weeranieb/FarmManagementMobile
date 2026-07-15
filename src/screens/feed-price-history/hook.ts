import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import {
  feedCollectionKeys,
  useAddFeedPriceHistory,
  useFeedCollectionsData,
  useFeedPriceHistoryData,
  type FeedCollectionModel,
  type FeedPriceHistoryEntry,
} from '@/features/feed-collection';
import { toNoonUtcIso } from '@/shared/time';
import { chronological, priceAroundDaysAgo, sliceByRange, type RangeId } from './historyUtils';

export type UpdatePricePayload = {
  id: number;
  price: number;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type FeedPriceHistoryState = {
  /** Top of the feed-collection list — used to render the header. `null` while resolving. */
  feed: FeedCollectionModel | null;
  feedNotFound: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  /** Newest-last chronological slice in the active range. */
  chartData: FeedPriceHistoryEntry[];
  /** Newest-first list for the timeline UI. */
  timelineEntries: FeedPriceHistoryEntry[];
  /** Most recent point, regardless of range. `null` if no history. */
  current: FeedPriceHistoryEntry | null;
  /** Month-over-month delta percentage of `current.price`. `null` if no baseline. */
  deltaPct: number | null;
  /** True when the feed has exactly one (or zero) historical points — chart is empty. */
  isEmpty: boolean;

  range: RangeId;
  setRange: (r: RangeId) => void;

  tip: number | null;
  setTip: (i: number | null) => void;

  sheet: SheetMode;
  openUpdatePrice: () => void;
  closeSheet: () => void;
  overflowOpen: boolean;
  toggleOverflow: () => void;
  closeOverflow: () => void;

  handleUpdatePrice: (payload: UpdatePricePayload) => void;
};

export type SheetMode = null | 'update-price';

/**
 * @param feedCollectionId — route param. Hook gracefully handles `NaN` / unknown
 *   ids by reporting `feedNotFound: true`.
 */
export function useFeedPriceHistoryScreen(feedCollectionId: number): FeedPriceHistoryState {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  /** "Update price" + overflow menu require `userLevel >= ClientAdmin` — matches web's gate. */
  const isAdmin = isClientAdmin(user);

  const { data: feeds } = useFeedCollectionsData();
  const { data: history, isLoading } = useFeedPriceHistoryData(feedCollectionId);

  const feed = useMemo(
    () => feeds.find((f) => f.id === feedCollectionId) ?? null,
    [feeds, feedCollectionId],
  );
  const feedNotFound = !feed;

  const [range, setRange] = useState<RangeId>('6m');
  const [tip, setTip] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Chronological (oldest → newest) — the source of truth for chart math.
  const sortedAll = useMemo(() => chronological(history), [history]);

  // Range slice — chart + stats both consume this so the window is consistent.
  const chartData = useMemo(() => {
    const newest = sortedAll[sortedAll.length - 1];
    if (!newest) return [];
    // Treat the newest point's date as "now" for slicing — matches how the
    // design's mock fixture pins range cutoffs to the most recent recorded day.
    return sliceByRange(sortedAll, range, new Date(newest.effectiveDate));
  }, [sortedAll, range]);

  const timelineEntries = useMemo(() => sortedAll.slice().reverse(), [sortedAll]);

  const current: FeedPriceHistoryEntry | null = sortedAll[sortedAll.length - 1] ?? null;
  const isEmpty = sortedAll.length <= 1;

  const deltaPct = useMemo(() => {
    if (!current) return null;
    const baseline = priceAroundDaysAgo(sortedAll, current, 30);
    if (!baseline || baseline.price === 0) return null;
    return ((current.price - baseline.price) / baseline.price) * 100;
  }, [sortedAll, current]);

  const addPriceMutation = useAddFeedPriceHistory();

  const openUpdatePrice = useCallback(() => {
    setOverflowOpen(false);
    setSheet('update-price');
  }, []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const toggleOverflow = useCallback(() => setOverflowOpen((v) => !v), []);
  const closeOverflow = useCallback(() => setOverflowOpen(false), []);

  const handleUpdatePrice = useCallback(
    (payload: UpdatePricePayload) => {
      const iso = toNoonUtcIso(payload.effectiveDate);
      addPriceMutation.mutate(
        {
          feedCollectionId: payload.id,
          price: payload.price,
          priceUpdatedDate: iso,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: feedCollectionKeys.priceHistory(payload.id),
            });
          },
        },
      );
    },
    [addPriceMutation, queryClient],
  );

  return {
    feed,
    feedNotFound,
    isAdmin,
    isLoading,
    chartData,
    timelineEntries,
    current,
    deltaPct,
    isEmpty,
    range,
    setRange: (r) => {
      setRange(r);
      setTip(null);
    },
    tip,
    setTip,
    sheet,
    openUpdatePrice,
    closeSheet,
    overflowOpen,
    toggleOverflow,
    closeOverflow,
    handleUpdatePrice,
  };
}
