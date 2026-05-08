import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useRouter } from 'expo-router';
import { FarmsScreen } from '@/screens/farms';

export default function FarmsRoute() {
  const router = useRouter();
  return (
    <ThemedSafeAreaView edges={['top']}>
      <FarmsScreen onOpenFarm={(id) => router.push(`/(app)/(tabs)/farm/${id}`)} />
    </ThemedSafeAreaView>
  );
}
