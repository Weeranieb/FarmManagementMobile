import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DailyLogScreen } from '@/screens/DailyLogScreen';

export default function DailyLogRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const pondId = Number(params.id ?? 11);
  return (
    <ThemedSafeAreaView edges={['top']}>
      <DailyLogScreen pondId={pondId} onBack={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
