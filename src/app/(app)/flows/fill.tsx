import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FillFlow } from '@/screens/flows/FillFlow';

export default function FillRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const pondId = Number(params.pondId ?? 11);
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FillFlow pondId={pondId} onClose={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
