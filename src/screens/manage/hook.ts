import { useCallback, useMemo } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { useFeedCollectionsData } from '@/features/feed-collection';

const FEED_COLLECTION_ROUTE = '/feed-collection' as unknown as Href;

export type ManageScreenState = {
  isAdmin: boolean;
  feedCount: number;
  feedLatestUpdate: Date | null;
  openFeedCollection: () => void;
};

export function useManageScreen(): ManageScreenState {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  /** Anyone signed in is the farm owner/admin in the current data model. */
  const isAdmin = user != null;

  const { data: feeds } = useFeedCollectionsData();

  const feedLatestUpdate = useMemo(() => {
    if (!feeds.length) return null;
    const ts = feeds.reduce((acc, f) => {
      const t = new Date(f.updatedAt).getTime();
      return Number.isFinite(t) && t > acc ? t : acc;
    }, 0);
    return ts ? new Date(ts) : null;
  }, [feeds]);

  const openFeedCollection = useCallback(() => {
    router.push(FEED_COLLECTION_ROUTE);
  }, [router]);

  return {
    isAdmin,
    feedCount: feeds.length,
    feedLatestUpdate,
    openFeedCollection,
  };
}
