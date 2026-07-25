import { useCallback, useMemo } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { useFeedCollectionsData } from '@/features/feed-collection';
import { useMerchantsData } from '@/features/merchant';

const FEED_COLLECTION_ROUTE = '/feed-collection' as unknown as Href;
const MERCHANTS_ROUTE = '/merchants' as unknown as Href;

/** Latest `updatedAt` across a list, or null when empty / unparseable. */
function latestUpdate(items: { updatedAt: string }[]): Date | null {
  if (!items.length) return null;
  const ts = items.reduce((acc, it) => {
    const t = new Date(it.updatedAt).getTime();
    return Number.isFinite(t) && t > acc ? t : acc;
  }, 0);
  return ts ? new Date(ts) : null;
}

export type ManageScreenState = {
  isAdmin: boolean;
  feedCount: number;
  feedLatestUpdate: Date | null;
  openFeedCollection: () => void;
  merchantCount: number;
  merchantLatestUpdate: Date | null;
  openMerchants: () => void;
};

export function useManageScreen(): ManageScreenState {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  /** Anyone signed in is the farm owner/admin in the current data model. */
  const isAdmin = user != null;

  const { data: feeds } = useFeedCollectionsData();
  const { data: merchants } = useMerchantsData();

  const feedLatestUpdate = useMemo(() => latestUpdate(feeds), [feeds]);
  const merchantLatestUpdate = useMemo(() => latestUpdate(merchants), [merchants]);

  const openFeedCollection = useCallback(() => {
    router.push(FEED_COLLECTION_ROUTE);
  }, [router]);
  const openMerchants = useCallback(() => {
    router.push(MERCHANTS_ROUTE);
  }, [router]);

  return {
    isAdmin,
    feedCount: feeds.length,
    feedLatestUpdate,
    openFeedCollection,
    merchantCount: merchants.length,
    merchantLatestUpdate,
    openMerchants,
  };
}
