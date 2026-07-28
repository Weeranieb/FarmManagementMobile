import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { WorkersScreen } from '@/screens/workers';

export default function WorkersRoute() {
  return (
    <ThemedSafeAreaView edges={['top']}>
      <WorkersScreen />
    </ThemedSafeAreaView>
  );
}
