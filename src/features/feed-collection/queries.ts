import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { farmKeys } from '@/features/farm';
import { pondKeys } from '@/features/pond';
import {
  addFeedPriceHistory,
  createFeedCollection,
  deleteFeedPriceHistory,
  listFeedCollections,
  listFeedPriceHistory,
  updateFeedCollection,
  updateFeedPriceHistory,
} from './service';
import {
  adaptFeedCollection,
  adaptFeedPriceHistory,
  type FeedCollectionModel,
  type FeedPriceHistoryEntry,
} from './adapters';
import type {
  CreateFeedCollectionRequest,
  CreateFeedPriceHistoryRequest,
  UpdateFeedCollectionRequest,
  UpdateFeedPriceHistoryRequest,
} from './types';

export const feedCollectionKeys = {
  all: () => ['feed-collections'] as const,
  priceHistory: (feedCollectionId: number) =>
    ['feed-collections', 'price-history', feedCollectionId] as const,
} as const;

/**
 * A feed's price feeds every pond's *derived* feed cost (and thus cycle P&L +
 * farm aggregates), so changing price history must refresh those too — not just
 * the feed screens. `['pond']` is the shared prefix of pond detail/activities/
 * cycles (distinct from the `['ponds']` list key).
 */
function invalidateFeedCostConsumers(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: pondKeys.all() });
  qc.invalidateQueries({ queryKey: ['pond'] });
  qc.invalidateQueries({ queryKey: farmKeys.all() });
}

export function useFeedCollections() {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: feedCollectionKeys.all(),
    queryFn: listFeedCollections,
    enabled,
  });
}

/**
 * Returns adapted UI models from the real API. The feed-collection routes
 * sit under the authenticated `(app)` route group, so callers can assume a
 * signed-in user; an unauthenticated read is reported as `isError`.
 */
export function useFeedCollectionsData(): {
  data: FeedCollectionModel[];
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = useIsAuthenticated();
  const q = useFeedCollections();
  const raw = q.data;
  if (!enabled || q.isError || raw == null || !Array.isArray(raw)) {
    return { data: [], isLoading: enabled && q.isLoading, isError: !enabled || q.isError };
  }
  return {
    data: raw.map(adaptFeedCollection),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

export function useCreateFeedCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFeedCollectionRequest) => createFeedCollection(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedCollectionKeys.all() }),
  });
}

export function useUpdateFeedCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFeedCollectionRequest) => updateFeedCollection(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedCollectionKeys.all() }),
  });
}

export function useAddFeedPriceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFeedPriceHistoryRequest) => addFeedPriceHistory(body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: feedCollectionKeys.all() });
      qc.invalidateQueries({
        queryKey: feedCollectionKeys.priceHistory(variables.feedCollectionId),
      });
      invalidateFeedCostConsumers(qc);
    },
  });
}

export function useUpdateFeedPriceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFeedPriceHistoryRequest) => updateFeedPriceHistory(body),
    onSuccess: (_data, variables) => {
      // Editing an entry can change the latest price shown on the collection list.
      qc.invalidateQueries({ queryKey: feedCollectionKeys.all() });
      qc.invalidateQueries({
        queryKey: feedCollectionKeys.priceHistory(variables.feedCollectionId),
      });
      invalidateFeedCostConsumers(qc);
    },
  });
}

export function useDeleteFeedPriceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; feedCollectionId: number }) => deleteFeedPriceHistory(id),
    onSuccess: (_data, variables) => {
      // Deleting an entry can change the latest price shown on the collection list.
      qc.invalidateQueries({ queryKey: feedCollectionKeys.all() });
      qc.invalidateQueries({
        queryKey: feedCollectionKeys.priceHistory(variables.feedCollectionId),
      });
      invalidateFeedCostConsumers(qc);
    },
  });
}

export function useFeedPriceHistory(feedCollectionId: number) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: feedCollectionKeys.priceHistory(feedCollectionId),
    queryFn: () => listFeedPriceHistory(feedCollectionId),
    enabled: enabled && Number.isFinite(feedCollectionId) && feedCollectionId > 0,
  });
}

/**
 * Returns the adapted price-history list for a feed from the real API.
 * Unauthenticated reads and API errors are surfaced honestly via `isError`.
 */
export function useFeedPriceHistoryData(feedCollectionId: number): {
  data: FeedPriceHistoryEntry[];
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = useIsAuthenticated();
  const q = useFeedPriceHistory(feedCollectionId);
  if (!enabled || q.isError || q.data == null || !Array.isArray(q.data)) {
    return { data: [], isLoading: enabled && q.isLoading, isError: !enabled || q.isError };
  }
  return {
    data: q.data.map(adaptFeedPriceHistory),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
