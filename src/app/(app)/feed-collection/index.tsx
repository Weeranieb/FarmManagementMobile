import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { FeedCollectionScreen } from '@/screens/feed-collection';

export default function FeedCollectionRoute() {
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FeedCollectionScreen />
    </ThemedSafeAreaView>
  );
}
