import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import {
  addFeedPriceHistory,
  createFeedCollection,
  listFeedCollections,
  updateFeedCollection,
} from './service';
import { adaptFeedCollection, type FeedCollectionModel } from './adapters';
import { mockFeedCollections } from './__mocks__/data';
import type {
  CreateFeedCollectionRequest,
  CreateFeedPriceHistoryRequest,
  UpdateFeedCollectionRequest,
} from './types';

export const feedCollectionKeys = {
  all: () => ['feed-collections'] as const,
} as const;

export function useFeedCollections() {
  return useQuery({ queryKey: feedCollectionKeys.all(), queryFn: listFeedCollections });
}

/**
 * Returns adapted UI models, falling back to mock data when not signed in / API
 * errors. Screens render the same shape either way.
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
    return { data: mockFeedCollections, isLoading: false, isError: false };
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
    onSuccess: () => qc.invalidateQueries({ queryKey: feedCollectionKeys.all() }),
  });
}
