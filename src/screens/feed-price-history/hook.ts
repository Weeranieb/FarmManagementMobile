import { useCallback, useMemo, useState } from 'react';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import {
  useAddFeedPriceHistory,
  useDeleteFeedPriceHistory,
  useFeedCollectionsData,
  useFeedPriceHistoryData,
  useUpdateFeedPriceHistory,
  type FeedCollectionModel,
  type FeedPriceHistoryEntry,
} from '@/features/feed-collection';
import { toNoonUtcIso } from '@/shared/time';
import { chronological, priceAroundDaysAgo, sliceByRange, type RangeId } from './historyUtils';

export type AddPricePayload = {
  /** Feed-collection id. */
  id: number;
  price: number;
  pricePerKg: number | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type EditPricePayload = {
  /** Price-history entry id. */
  entryId: number;
  price: number;
  pricePerKg: number | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type SheetMode = null | 'add' | 'edit' | 'confirm-delete';

export type FeedPriceHistoryState = {
  /** Top of the feed-collection list — used to render the header. `null` while resolving. */
  feed: FeedCollectionModel | null;
  feedNotFound: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  /** Newest-last chronological slice in the active range. */
  chartData: FeedPriceHistoryEntry[];
  /** Full history, oldest → newest — collision checks + diff baselines. */
  allEntries: FeedPriceHistoryEntry[];
  /** Newest-first list for the timeline UI. */
  timelineEntries: FeedPriceHistoryEntry[];
  /** Most recent point, regardless of range. `null` if no history. */
  current: FeedPriceHistoryEntry | null;
  /** Month-over-month delta percentage of `current.price`. `null` if no baseline. */
  deltaPct: number | null;
  /** True when the feed has zero historical points. */
  isEmpty: boolean;
  /** True when the feed has exactly one point — no chart, but the row is editable. */
  isSingle: boolean;

  range: RangeId;
  setRange: (r: RangeId) => void;

  tip: number | null;
  setTip: (i: number | null) => void;

  sheet: SheetMode;
  /** Entry backing the edit sheet / delete dialog. */
  selectedEntry: FeedPriceHistoryEntry | null;
  openAdd: () => void;
  openEdit: (entryId: number) => void;
  closeSheet: () => void;
  overflowOpen: boolean;
  toggleOverflow: () => void;
  closeOverflow: () => void;

  handleAdd: (payload: AddPricePayload) => void;
  handleEdit: (payload: EditPricePayload) => void;
  /** Add-mode date collision: overwrite the colliding entry's price (its date stays). */
  handleOverwrite: (payload: { entryId: number; price: number; pricePerKg: number | null }) => void;

  /** Opens the delete-confirm dialog (soft delete via DELETE /feed-price-history/:id). */
  requestDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
};

/**
 * @param feedCollectionId — route param. Hook gracefully handles `NaN` / unknown
 *   ids by reporting `feedNotFound: true`.
 */
export function useFeedPriceHistoryScreen(feedCollectionId: number): FeedPriceHistoryState {
  const user = useAuthStore((s) => s.user);
  /** Editing (rows, overflow, sheets) requires `userLevel >= ClientAdmin` — matches web's gate. */
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
  const isEmpty = sortedAll.length === 0;
  const isSingle = sortedAll.length === 1;

  const selectedEntry = useMemo(
    () => sortedAll.find((e) => e.id === selectedId) ?? null,
    [sortedAll, selectedId],
  );

  const deltaPct = useMemo(() => {
    if (!current) return null;
    const baseline = priceAroundDaysAgo(sortedAll, current, 30);
    if (!baseline || baseline.price === 0) return null;
    return ((current.price - baseline.price) / baseline.price) * 100;
  }, [sortedAll, current]);

  const addPriceMutation = useAddFeedPriceHistory();
  const updatePriceMutation = useUpdateFeedPriceHistory();
  const deletePriceMutation = useDeleteFeedPriceHistory();

  const openAdd = useCallback(() => {
    setOverflowOpen(false);
    setSheet('add');
  }, []);
  const openEdit = useCallback((entryId: number) => {
    setSelectedId(entryId);
    setSheet('edit');
  }, []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const toggleOverflow = useCallback(() => setOverflowOpen((v) => !v), []);
  const closeOverflow = useCallback(() => setOverflowOpen(false), []);

  const handleAdd = useCallback(
    (payload: AddPricePayload) => {
      addPriceMutation.mutate({
        feedCollectionId: payload.id,
        price: payload.price,
        pricePerKg: payload.pricePerKg,
        priceUpdatedDate: toNoonUtcIso(payload.effectiveDate),
      });
    },
    [addPriceMutation],
  );

  const handleEdit = useCallback(
    (payload: EditPricePayload) => {
      updatePriceMutation.mutate({
        id: payload.entryId,
        feedCollectionId,
        price: payload.price,
        pricePerKg: payload.pricePerKg,
        priceUpdatedDate: toNoonUtcIso(payload.effectiveDate),
      });
    },
    [updatePriceMutation, feedCollectionId],
  );

  const handleOverwrite = useCallback(
    (payload: { entryId: number; price: number; pricePerKg: number | null }) => {
      const target = sortedAll.find((e) => e.id === payload.entryId);
      if (!target) return;
      updatePriceMutation.mutate({
        id: target.id,
        feedCollectionId,
        price: payload.price,
        pricePerKg: payload.pricePerKg,
        priceUpdatedDate: toNoonUtcIso(target.effectiveDate),
      });
    },
    [updatePriceMutation, feedCollectionId, sortedAll],
  );

  const requestDelete = useCallback(() => setSheet('confirm-delete'), []);
  const cancelDelete = useCallback(() => setSheet('edit'), []);
  const confirmDelete = useCallback(() => {
    if (selectedId == null) {
      setSheet(null);
      return;
    }
    deletePriceMutation.mutate({ id: selectedId, feedCollectionId });
    setSheet(null);
  }, [deletePriceMutation, selectedId, feedCollectionId]);

  return {
    feed,
    feedNotFound,
    isAdmin,
    isLoading,
    chartData,
    allEntries: sortedAll,
    timelineEntries,
    current,
    deltaPct,
    isEmpty,
    isSingle,
    range,
    setRange: (r) => {
      setRange(r);
      setTip(null);
    },
    tip,
    setTip,
    sheet,
    selectedEntry,
    openAdd,
    openEdit,
    closeSheet,
    overflowOpen,
    toggleOverflow,
    closeOverflow,
    handleAdd,
    handleEdit,
    handleOverwrite,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
