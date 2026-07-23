import type { FeedCollectionPageItem, FeedKind, FeedPriceHistoryResponse } from './types';

/** UI-facing model. DTOs from `./types` get adapted into this. */
export type FeedCollectionModel = {
  id: number;
  name: string;
  kind: FeedKind;
  unit: string;
  /** Latest price for this feed; `null` when no price history has been recorded. */
  price: number | null;
  fcr: number | null;
  /** kg content of one purchase pack (bag for pellet, crate for fresh); `null` until the user sets it. */
  packSizeKg: number | null;
  /** Optional supplier / source (ผู้ขาย / แหล่งที่มา); `null` when not recorded. */
  supplier: string | null;
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
    packSizeKg: f.packSizeKg == null ? null : Number(f.packSizeKg),
    supplier: f.supplier ?? null,
    updatedAt: f.latestPriceUpdatedDate ?? f.updatedAt,
  };
}

/** UI-facing single price-history entry. Date is an ISO `YYYY-MM-DD` string. */
export type FeedPriceHistoryEntry = {
  id: number;
  feedCollectionId: number;
  price: number;
  /** Price per kg snapshotted at entry time; `null` for entries recorded before this existed. */
  pricePerKg: number | null;
  /** ISO `YYYY-MM-DD` — day the price became effective. */
  effectiveDate: string;
};

function toYmd(iso: string): string {
  // The backend returns RFC3339 timestamps; the UI only cares about the day.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function adaptFeedPriceHistory(p: FeedPriceHistoryResponse): FeedPriceHistoryEntry {
  return {
    id: p.id,
    feedCollectionId: p.feedCollectionId,
    price: Number(p.price),
    pricePerKg: p.pricePerKg == null ? null : Number(p.pricePerKg),
    effectiveDate: toYmd(p.priceUpdatedDate),
  };
}
