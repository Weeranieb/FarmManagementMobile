import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { listActivityFeed } from './service';
import { adaptActivityFeedItem, type ActivityEventModel } from './adapters';

export const activityKeys = {
  all: () => ['activity'] as const,
  feed: (limit?: number) =>
    limit && limit > 0 ? (['activity', 'feed', limit] as const) : (['activity', 'feed'] as const),
} as const;

export function useActivityFeed(limit?: number) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: activityKeys.feed(limit),
    queryFn: () => listActivityFeed(limit),
    enabled,
  });
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
