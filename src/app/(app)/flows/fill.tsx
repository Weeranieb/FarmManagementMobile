import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FillFlow } from '@/screens/flows/fill';

export default function FillRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const parsed = params.pondId != null ? Number(params.pondId) : NaN;
  const pondId = Number.isFinite(parsed) ? parsed : undefined;
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FillFlow pondId={pondId} onClose={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
