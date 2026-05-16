import type { FeedCollectionPageItem, FeedKind } from './types';

/** UI-facing model. DTOs from `./types` get adapted into this. */
export type FeedCollectionModel = {
  id: number;
  name: string;
  kind: FeedKind;
  unit: string;
  /** Latest price for this feed; `null` when no price history has been recorded. */
  price: number | null;
  fcr: number | null;
  /** ISO date — date the latest price became effective; falls back to record updatedAt. */
  updatedAt: string;
};

function normalizeKind(feedType: string): FeedKind {
  return feedType === 'fresh' ? 'fresh' : 'pellet';
}

export function adaptFeedCollection(f: FeedCollectionPageItem): FeedCollectionModel {
  return {
    id: f.id,
    name: f.name,
    kind: normalizeKind(f.feedType),
    unit: f.unit || 'กก.',
    price: f.latestPrice ?? null,
    fcr: f.fcr == null ? null : Number(f.fcr),
    updatedAt: f.latestPriceUpdatedDate ?? f.updatedAt,
  };
}
