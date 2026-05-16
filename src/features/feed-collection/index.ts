export {
  listFeedCollections,
  createFeedCollection,
  updateFeedCollection,
  addFeedPriceHistory,
} from './service';
export {
  feedCollectionKeys,
  useFeedCollections,
  useFeedCollectionsData,
  useCreateFeedCollection,
  useUpdateFeedCollection,
  useAddFeedPriceHistory,
} from './queries';
export { adaptFeedCollection, type FeedCollectionModel } from './adapters';
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
export { mockFeedCollections } from './__mocks__/data';
