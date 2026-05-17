import { useFeedCollectionScreen } from './hook';
import { FeedCollectionView } from './view';

type Props = { showHeader?: boolean };

export function FeedCollectionScreen(props: Props) {
  const state = useFeedCollectionScreen();
  return <FeedCollectionView {...state} {...props} />;
}
