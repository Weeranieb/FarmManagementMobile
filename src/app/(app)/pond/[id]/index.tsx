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
        onOpenDailyLog={({ farmId, pondId }) =>
          router.push({
            pathname: '/(app)/daily-log',
            params: { farmId: String(farmId), pondId: String(pondId) },
          })
        }
        onOpenLedger={() =>
          router.push({
            pathname: '/(app)/pond/[id]/ledger',
            params: { id: String(pondId) },
          })
        }
      />
    </ThemedSafeAreaView>
  );
}
