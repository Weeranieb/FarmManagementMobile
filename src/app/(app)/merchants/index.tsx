import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { MerchantsScreen } from '@/screens/merchants';

export default function MerchantsRoute() {
  return (
    <ThemedSafeAreaView edges={['top']}>
      <MerchantsScreen />
    </ThemedSafeAreaView>
  );
}
