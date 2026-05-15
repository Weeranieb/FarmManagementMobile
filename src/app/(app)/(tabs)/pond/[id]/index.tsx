import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PondDetailScreen } from '@/screens/pond-detail';

export default function PondDetailRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const pondId = Number(params.id ?? 11);

  return (
    <ThemedSafeAreaView edges={['top']}>
      <PondDetailScreen
        pondId={pondId}
        onBack={() => router.back()}
        onAction={(kind) => router.push(`/(app)/flows/${kind}?pondId=${pondId}`)}
        onOpenDailyLog={(id) => router.push(`/(app)/(tabs)/pond/${id}/daily-log`)}
      />
    </ThemedSafeAreaView>
  );
}
