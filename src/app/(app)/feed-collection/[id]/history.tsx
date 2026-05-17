import { useLocalSearchParams } from 'expo-router';
import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { FeedPriceHistoryScreen } from '@/screens/feed-price-history';

export default function FeedPriceHistoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FeedPriceHistoryScreen feedCollectionId={Number.isFinite(numericId) ? numericId : NaN} />
    </ThemedSafeAreaView>
  );
}
