import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FarmsScreen } from '@/screens/farms';

export default function FarmsRoute() {
  const router = useRouter();
  // Home's empty hero sends `?newFarm=1` so the create sheet opens on arrival —
  // farm creation lives here instead of being duplicated on Home.
  const { newFarm } = useLocalSearchParams<{ newFarm?: string }>();
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FarmsScreen
        autoOpenCreate={newFarm === '1'}
        onOpenFarm={(id) => router.push(`/(app)/farm/${id}`)}
      />
    </ThemedSafeAreaView>
  );
}
