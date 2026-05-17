export {
  listFeedCollections,
  createFeedCollection,
  updateFeedCollection,
  addFeedPriceHistory,
  listFeedPriceHistory,
} from './service';
export {
  feedCollectionKeys,
  useFeedCollections,
  useFeedCollectionsData,
  useCreateFeedCollection,
  useUpdateFeedCollection,
  useAddFeedPriceHistory,
  useFeedPriceHistory,
  useFeedPriceHistoryData,
} from './queries';
export {
  adaptFeedCollection,
  adaptFeedPriceHistory,
  type FeedCollectionModel,
  type FeedPriceHistoryEntry,
} from './adapters';
export type {
  FeedCollectionResponse,
  FeedCollectionPageItem,
  FeedCollectionListResponse,
  CreateFeedCollectionRequest,
  CreateFeedPriceHistoryItemRequest,
  CreateFeedPriceHistoryRequest,
  UpdateFeedCollectionRequest,
  FeedPriceHistoryResponse,
  FeedKind,
} from './types';
