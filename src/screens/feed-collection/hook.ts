import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import {
  feedCollectionKeys,
  useAddFeedPriceHistory,
  useCreateFeedCollection,
  useFeedCollectionsData,
  useUpdateFeedCollection,
  type CreateFeedCollectionRequest,
  type FeedCollectionModel,
  type FeedKind,
  type UpdateFeedCollectionRequest,
} from '@/features/feed-collection';
import { FEED_TYPE_LABEL_TH } from './feedPalette';

export type FeedSheetMode = 'actions' | 'add' | 'edit' | 'update-price' | null;

export type AddFeedFormPayload = {
  name: string;
  kind: FeedKind;
  unit: string;
  price: number;
  fcr: number | null;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type UpdatePriceFormPayload = {
  id: number;
  price: number;
  /** ISO date (YYYY-MM-DD). */
  effectiveDate: string;
};

export type FeedCollectionState = {
  feeds: FeedCollectionModel[];
  filtered: FeedCollectionModel[];
  isAdmin: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
  sheet: FeedSheetMode;
  activeFeed: FeedCollectionModel | null;
  openActions: (feed: FeedCollectionModel) => void;
  openAdd: () => void;
  openEdit: () => void;
  openUpdatePrice: () => void;
  closeSheet: () => void;
  handleCreate: (payload: AddFeedFormPayload) => void;
  handleEdit: (payload: AddFeedFormPayload) => void;
  handleUpdatePrice: (payload: UpdatePriceFormPayload) => void;
  handleOpenHistory: (feed: FeedCollectionModel) => void;
};

function toIsoTimestamp(yyyyMmDd: string): string {
  // Anchor the day at noon UTC so timezone wobble doesn't slip the date.
  return new Date(`${yyyyMmDd}T12:00:00Z`).toISOString();
}

export function useFeedCollectionScreen(): FeedCollectionState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  /** Admin actions (add/edit/update-price) require `userLevel >= ClientAdmin` — matches web's gate in `useFeedCollectionsPage`. */
  const isAdmin = isClientAdmin(user);

  const { data: feeds } = useFeedCollectionsData();

  const [refreshing, setRefreshing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<FeedSheetMode>(null);
  const [activeFeed, setActiveFeed] = useState<FeedCollectionModel | null>(null);

  const createMutation = useCreateFeedCollection();
  const updateMutation = useUpdateFeedCollection();
  const addPriceMutation = useAddFeedPriceHistory();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return feeds;
    return feeds.filter((f) => {
      const name = f.name.toLowerCase();
      const kindLabel = FEED_TYPE_LABEL_TH[f.kind];
      return name.includes(q) || kindLabel.includes(query.trim());
    });
  }, [feeds, query]);

  const onOpenSearch = useCallback(() => setSearchOpen(true), []);
  const onCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery('');
  }, []);
  const onChangeQuery = useCallback((s: string) => setQuery(s), []);

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
        feedPriceHistories: [
          { price: payload.price, priceUpdatedDate: toIsoTimestamp(payload.effectiveDate) },
        ],
      };
      createMutation.mutate(body);
    },
    [createMutation],
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
      };
      updateMutation.mutate(body);
    },
    [activeFeed, updateMutation],
  );

  const handleUpdatePrice = useCallback(
    (payload: UpdatePriceFormPayload) => {
      addPriceMutation.mutate({
        feedCollectionId: payload.id,
        price: payload.price,
        priceUpdatedDate: toIsoTimestamp(payload.effectiveDate),
      });
    },
    [addPriceMutation],
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
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
    sheet,
    activeFeed,
    openActions,
    openAdd,
    openEdit,
    openUpdatePrice,
    closeSheet,
    handleCreate,
    handleEdit,
    handleUpdatePrice,
    handleOpenHistory,
  };
}
