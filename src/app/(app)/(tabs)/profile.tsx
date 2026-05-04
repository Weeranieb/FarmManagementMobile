import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { ProfileScreen } from '@/screens/ProfileScreen';

export default function ProfileRoute() {
  return (
    <ThemedSafeAreaView edges={['top']}>
      <ProfileScreen />
    </ThemedSafeAreaView>
  );
}
