import { useFeedPriceHistoryScreen } from './hook';
import { FeedPriceHistoryView } from './view';

type Props = {
  /** Feed-collection id from the route param. */
  feedCollectionId: number;
};

export function FeedPriceHistoryScreen({ feedCollectionId }: Props) {
  const state = useFeedPriceHistoryScreen(feedCollectionId);
  return <FeedPriceHistoryView {...state} />;
}
