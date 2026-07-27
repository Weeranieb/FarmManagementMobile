import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import {
  feedCollectionKeys,
  useAddFeedPriceHistory,
  useCreateFeedCollection,
  useFeedCollectionsData,
  useFeedPriceHistoryData,
  useUpdateFeedCollection,
  useUpdateFeedPriceHistory,
  type CreateFeedCollectionRequest,
  type FeedCollectionModel,
  type FeedKind,
  type FeedPriceHistoryEntry,
  type UpdateFeedCollectionRequest,
} from '@/features/feed-collection';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import { toNoonUtcIso } from '@/shared/time';
import { fmt } from '@/utils/fmt';
import { FEED_TYPE_LABEL_TH } from './feedPalette';

export type FeedSheetMode = 'actions' | 'add' | 'edit' | 'update-price' | null;

export type AddFeedFormPayload = {
  name: string;
  kind: FeedKind;
  unit: string;
  price: number;
  pricePerKg: number | null;
  fcr: number | null;
  packSizeKg: number | null;
  supplier: string | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type UpdatePriceFormPayload = {
  id: number;
  price: number;
  pricePerKg: number | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type FeedCollectionState = {
  feeds: FeedCollectionModel[];
  filtered: FeedCollectionModel[];
  isAdmin: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  /** The list failed to load — the view shows an error + retry rather than the
   *  "no feed yet" empty state. */
  isError: boolean;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
  sheet: FeedSheetMode;
  activeFeed: FeedCollectionModel | null;
  /** Chronological (oldest → newest) price history of `activeFeed` — feeds the
   *  update-price sheet's date-collision check and overwrite path. */
  activeFeedPriceHistory: FeedPriceHistoryEntry[];
  openActions: (feed: FeedCollectionModel) => void;
  openAdd: () => void;
  openEdit: () => void;
  openUpdatePrice: () => void;
  closeSheet: () => void;
  saving: boolean;
  handleCreate: (payload: AddFeedFormPayload) => void;
  handleEdit: (payload: AddFeedFormPayload) => void;
  handleUpdatePrice: (payload: UpdatePriceFormPayload) => void;
  /** Update-price date collision: overwrite the colliding entry's price (its date stays). */
  handleOverwritePrice: (payload: {
    entryId: number;
    price: number;
    pricePerKg: number | null;
  }) => void;
  handleOpenHistory: (feed: FeedCollectionModel) => void;

  /** Success confirmation shown after a price save. `null` when hidden; `key`
   *  bumps on each save so the toast replays its entrance. `detail` is the
   *  optional "name · ฿price/unit" second line. */
  priceToast: { key: number; detail?: string } | null;
  dismissPriceToast: () => void;
};

export function useFeedCollectionScreen(): FeedCollectionState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  /** Admin actions (add/edit/update-price) require `userLevel >= ClientAdmin` — matches web's gate in `useFeedCollectionsPage`. */
  const isAdmin = isClientAdmin(user);

  const { data: feeds, isError } = useFeedCollectionsData();

  const [refreshing, setRefreshing] = useState(false);
  const { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery } = useSearchQuery();
  const [sheet, setSheet] = useState<FeedSheetMode>(null);
  const [activeFeed, setActiveFeed] = useState<FeedCollectionModel | null>(null);
  const [priceToast, setPriceToast] =
    useState<{ key: number; detail?: string } | null>(null);
  const dismissPriceToast = useCallback(() => setPriceToast(null), []);
  const showPriceSaved = useCallback((detail?: string) => {
    setPriceToast((p) => ({ key: (p?.key ?? 0) + 1, detail }));
  }, []);

  // History of the feed whose ⋯ menu is open — the update-price sheet needs it
  // to warn on a duplicate date and offer an overwrite. Gated to `> 0`, so it
  // stays idle until a feed is active. Left unsorted: the sheet is add-only
  // here and reads `entries` only for an order-independent duplicate-date find.
  const { data: activeFeedPriceHistory } = useFeedPriceHistoryData(activeFeed?.id ?? 0);

  const createMutation = useCreateFeedCollection();
  const updateMutation = useUpdateFeedCollection();
  const addPriceMutation = useAddFeedPriceHistory();
  const updatePriceMutation = useUpdateFeedPriceHistory();
  /** True while any add/edit/price save is in flight — drives the sheet's saving button. */
  const saving =
    createMutation.isPending ||
    updateMutation.isPending ||
    addPriceMutation.isPending ||
    updatePriceMutation.isPending;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return feeds;
    return feeds.filter((f) => {
      const name = f.name.toLowerCase();
      const kindLabel = FEED_TYPE_LABEL_TH[f.kind];
      return name.includes(q) || kindLabel.includes(query.trim());
    });
  }, [feeds, query]);

  const openActions = useCallback((feed: FeedCollectionModel) => {
    setActiveFeed(feed);
    setSheet('actions');
  }, []);
  const openAdd = useCallback(() => {
    setActiveFeed(null);
    setSheet('add');
  }, []);
  const openEdit = useCallback(() => setSheet('edit'), []);
  const openUpdatePrice = useCallback(() => setSheet('update-price'), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: feedCollectionKeys.all() });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const handleCreate = useCallback(
    (payload: AddFeedFormPayload) => {
      const body: CreateFeedCollectionRequest = {
        name: payload.name,
        unit: payload.unit,
        feedType: payload.kind,
        fcr: payload.fcr,
        packSizeKg: payload.packSizeKg,
        supplier: payload.supplier,
        feedPriceHistories: [
          {
            price: payload.price,
            pricePerKg: payload.pricePerKg,
            priceUpdatedDate: toNoonUtcIso(payload.effectiveDate),
          },
        ],
      };
      // Close only once the save succeeds so the sheet's button can show a
      // saving state until then (and stays open on error for a retry).
      createMutation.mutate(body, { onSuccess: closeSheet });
    },
    [createMutation, closeSheet],
  );

  const handleEdit = useCallback(
    (payload: AddFeedFormPayload) => {
      if (!activeFeed) return;
      const body: UpdateFeedCollectionRequest = {
        id: activeFeed.id,
        name: payload.name,
        unit: payload.unit,
        feedType: payload.kind,
        fcr: payload.fcr,
        packSizeKg: payload.packSizeKg,
        supplier: payload.supplier,
      };
      // Edit is details-only — price is managed from the price-history screen
      // (อัปเดตราคา), so this never touches price. Close on save success.
      updateMutation.mutate(body, { onSuccess: closeSheet });
    },
    [activeFeed, updateMutation, closeSheet],
  );

  // "โปรฟีด · ฿940/ถุง" — the just-saved price, for the toast's second line.
  const priceDetail = useCallback(
    (price: number) =>
      activeFeed ? `${activeFeed.name} · ${fmt.baht(price)}/${activeFeed.unit}` : undefined,
    [activeFeed],
  );

  const handleUpdatePrice = useCallback(
    (payload: UpdatePriceFormPayload) => {
      const detail = priceDetail(payload.price);
      addPriceMutation.mutate(
        {
          feedCollectionId: payload.id,
          price: payload.price,
          pricePerKg: payload.pricePerKg,
          priceUpdatedDate: toNoonUtcIso(payload.effectiveDate),
        },
        {
          onSuccess: () => {
            closeSheet();
            showPriceSaved(detail);
          },
        },
      );
    },
    [addPriceMutation, closeSheet, priceDetail, showPriceSaved],
  );

  const handleOverwritePrice = useCallback(
    (payload: { entryId: number; price: number; pricePerKg: number | null }) => {
      if (!activeFeed) return;
      // Keep the colliding entry's own date — only its price changes.
      const target = activeFeedPriceHistory.find((e) => e.id === payload.entryId);
      if (!target) return;
      const detail = priceDetail(payload.price);
      updatePriceMutation.mutate(
        {
          id: target.id,
          feedCollectionId: activeFeed.id,
          price: payload.price,
          pricePerKg: payload.pricePerKg,
          priceUpdatedDate: toNoonUtcIso(target.effectiveDate),
        },
        {
          onSuccess: () => {
            closeSheet();
            showPriceSaved(detail);
          },
        },
      );
    },
    [activeFeed, activeFeedPriceHistory, updatePriceMutation, closeSheet, priceDetail, showPriceSaved],
  );

  const handleOpenHistory = useCallback(
    (feed: FeedCollectionModel) => {
      router.push(`/(app)/feed-collection/${feed.id}/history` as never);
    },
    [router],
  );

  return {
    feeds,
    filtered,
    isAdmin,
    refreshing,
    onRefresh,
    isError,
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
    sheet,
    activeFeed,
    activeFeedPriceHistory,
    openActions,
    openAdd,
    openEdit,
    openUpdatePrice,
    closeSheet,
    saving,
    handleCreate,
    handleEdit,
    handleUpdatePrice,
    handleOverwritePrice,
    handleOpenHistory,
    priceToast,
    dismissPriceToast,
  };
}
