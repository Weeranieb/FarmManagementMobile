import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { FarmPondsScreen } from '@/screens/farm-ponds';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function FarmPondsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ farmId?: string }>();
  const farmId = Number(params.farmId ?? 0);

  return (
    <ThemedSafeAreaView edges={['top']}>
      <FarmPondsScreen
        farmId={farmId}
        onBack={() => router.back()}
        onOpenPond={(pondId) => router.push(`/(app)/pond/${pondId}`)}
      />
    </ThemedSafeAreaView>
  );
}
