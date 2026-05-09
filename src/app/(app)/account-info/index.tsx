import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { AccountInfoScreen } from '@/screens/account-info';

export default function AccountInfoRoute() {
  return (
    <ThemedSafeAreaView edges={['top']}>
      <AccountInfoScreen />
    </ThemedSafeAreaView>
  );
}
