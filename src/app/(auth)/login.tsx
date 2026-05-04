import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { LoginScreen } from '@/screens/LoginScreen';

export default function LoginRoute() {
  return (
    <ThemedSafeAreaView edges={['top', 'bottom']}>
      <LoginScreen />
    </ThemedSafeAreaView>
  );
}
