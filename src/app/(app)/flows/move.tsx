import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MoveFlow } from '@/screens/flows/MoveFlow';

export default function MoveRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const pondId = Number(params.pondId ?? 11);
  return (
    <ThemedSafeAreaView edges={['top']}>
      <MoveFlow pondId={pondId} onClose={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
