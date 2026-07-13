import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PondLedgerScreen } from '@/screens/pond-ledger';

export default function PondLedgerRoute() {
  const params = useLocalSearchParams<{ id?: string; ym?: string }>();
  const router = useRouter();
  const pondId = Number(params.id ?? 0);

  return (
    <ThemedSafeAreaView edges={['top']}>
      <PondLedgerScreen pondId={pondId} ym={params.ym} onBack={() => router.back()} />
    </ThemedSafeAreaView>
  );
}
