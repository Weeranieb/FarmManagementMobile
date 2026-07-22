// DTOs mirroring backend/src/internal/dto/feed_collection_dto.go and
// feed_price_history_dto.go. Keep in sync as the API evolves.

export type FeedKind = 'pellet' | 'fresh';

/** Base feed-collection row (GET /feed-collection/:id, embedded by list). */
export type FeedCollectionResponse = {
  id: number;
  clientId: number;
  name: string;
  unit: string;
  feedType: FeedKind | string;
  fcr?: number | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

/** One row from `GET /feed-collection` paged list — embeds the base + latest-price columns. */
export type FeedCollectionPageItem = FeedCollectionResponse & {
  latestPrice: number | null;
  latestPriceUpdatedDate: string | null;
};

/** GET /feed-collection envelope. */
export type FeedCollectionListResponse = {
  items: FeedCollectionPageItem[];
  total: number;
};

export type CreateFeedPriceHistoryItemRequest = {
  price: number;
  /** ISO 8601 timestamp. */
  priceUpdatedDate: string;
};

export type CreateFeedCollectionRequest = {
  name: string;
  unit: string;
  feedType: FeedKind;
  fcr?: number | null;
  /** Required for super-admin without a clientId in the JWT. */
  clientId?: number;
  feedPriceHistories: CreateFeedPriceHistoryItemRequest[];
};

export type UpdateFeedCollectionRequest = {
  id: number;
  name: string;
  unit: string;
  feedType: FeedKind;
  fcr?: number | null;
};

export type CreateFeedPriceHistoryRequest = {
  feedCollectionId: number;
  price: number;
  /** ISO 8601 timestamp. */
  priceUpdatedDate: string;
};

export type UpdateFeedPriceHistoryRequest = {
  id: number;
  feedCollectionId: number;
  price: number;
  /** ISO 8601 timestamp. */
  priceUpdatedDate: string;
};

export type FeedPriceHistoryResponse = {
  id: number;
  feedCollectionId: number;
  price: number;
  priceUpdatedDate: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};
