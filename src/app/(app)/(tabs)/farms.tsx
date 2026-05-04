import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useRouter } from 'expo-router';
import { FarmsScreen } from '@/screens/FarmsScreen';

export default function FarmsRoute() {
  const router = useRouter();
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FarmsScreen onOpenFarm={(id) => router.push(`/(app)/pond/${id}`)} />
    </ThemedSafeAreaView>
  );
}
