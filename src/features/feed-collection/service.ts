import { http } from '@/shared/http';
import type {
  CreateFeedCollectionRequest,
  CreateFeedPriceHistoryRequest,
  FeedCollectionListResponse,
  FeedCollectionPageItem,
  FeedPriceHistoryResponse,
  UpdateFeedCollectionRequest,
  UpdateFeedPriceHistoryRequest,
} from './types';

/** Backend caps page size; we list the catalogue in a single call. */
const DEFAULT_PAGE_SIZE = 200;

function normalizePayload(body: unknown): FeedCollectionPageItem[] {
  if (Array.isArray(body)) return body as FeedCollectionPageItem[];
  if (
    body !== null &&
    typeof body === 'object' &&
    Array.isArray((body as FeedCollectionListResponse).items)
  ) {
    return (body as FeedCollectionListResponse).items;
  }
  return [];
}

export async function listFeedCollections(): Promise<FeedCollectionPageItem[]> {
  // `page` is 0-indexed on the backend (offset = page * pageSize).
  const payload = await http.get<unknown>('/feed-collection', {
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: 'id desc',
  });
  return normalizePayload(payload);
}

export function createFeedCollection(
  body: CreateFeedCollectionRequest,
): Promise<unknown> {
  return http.post('/feed-collection', body);
}

export function updateFeedCollection(
  body: UpdateFeedCollectionRequest,
): Promise<unknown> {
  return http.put('/feed-collection', body);
}

export function addFeedPriceHistory(
  body: CreateFeedPriceHistoryRequest,
): Promise<FeedPriceHistoryResponse> {
  return http.post('/feed-price-history', body);
}

export function updateFeedPriceHistory(
  body: UpdateFeedPriceHistoryRequest,
): Promise<unknown> {
  return http.put('/feed-price-history', body);
}

export function deleteFeedPriceHistory(id: number): Promise<unknown> {
  return http.delete(`/feed-price-history/${id}`);
}

export async function listFeedPriceHistory(
  feedCollectionId: number,
): Promise<FeedPriceHistoryResponse[]> {
  const payload = await http.get<unknown>('/feed-price-history', { feedCollectionId });
  if (Array.isArray(payload)) return payload as FeedPriceHistoryResponse[];
  return [];
}
