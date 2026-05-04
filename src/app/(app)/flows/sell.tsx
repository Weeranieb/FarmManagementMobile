import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SellFlow } from '@/screens/flows/SellFlow';

export default function SellRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const pondId = Number(params.pondId ?? 11);
  return (
    <ThemedSafeAreaView edges={['top']}>
      <SellFlow pondId={pondId} onClose={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
