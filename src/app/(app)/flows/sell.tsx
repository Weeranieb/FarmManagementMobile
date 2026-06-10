import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SellFlow } from '@/screens/flows/sell';

export default function SellRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const parsed = params.pondId != null ? Number(params.pondId) : NaN;
  const pondId = Number.isFinite(parsed) ? parsed : undefined;
  return (
    <ThemedSafeAreaView edges={['top']}>
      <SellFlow pondId={pondId} onClose={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
