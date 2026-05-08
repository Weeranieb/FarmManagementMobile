import { useRouter } from 'expo-router';
import { mockProfile, useAuthStore } from '@/features/auth';

export function useProfileScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clear);
  const profileName = useAuthStore((s) => s.user?.firstName) ?? mockProfile.name;

  const handleLogout = async () => {
    await clearSession();
    router.replace('/(auth)/login');
  };

  return { profileName, handleLogout };
}
