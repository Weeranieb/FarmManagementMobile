import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MoveFlow } from '@/screens/flows/move';

export default function MoveRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const parsed = params.pondId != null ? Number(params.pondId) : NaN;
  const pondId = Number.isFinite(parsed) ? parsed : undefined;
  return (
    <ThemedSafeAreaView edges={['top']}>
      <MoveFlow pondId={pondId} onClose={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
