import { useCallback, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { mockProfile, useAuthStore } from '@/features/auth';
import { useLanguage, type LanguageCode } from '@/screens/language';

const ACCOUNT_INFO_ROUTE = '/account-info' as unknown as Href;

export function useProfileScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? mockProfile.name.split(' ')[0] ?? '';
  const lastName = user?.lastName ?? mockProfile.name.split(' ').slice(1).join(' ');
  const username = user?.username ?? 'boonma_owner';
  const { selected: language, pick: pickLanguage } = useLanguage();
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);

  const handleLogout = useCallback(async () => {
    await clearSession();
    router.replace('/(auth)/login');
  }, [clearSession, router]);

  const openAccount = useCallback(() => {
    router.push(ACCOUNT_INFO_ROUTE);
  }, [router]);

  const openLanguage = useCallback(() => {
    setShowLanguageSheet(true);
  }, []);

  const closeLanguage = useCallback(() => {
    setShowLanguageSheet(false);
  }, []);

  const handlePickLanguage = useCallback(
    (code: LanguageCode) => {
      void pickLanguage(code);
    },
    [pickLanguage],
  );

  return {
    firstName,
    lastName,
    username,
    handleLogout,
    openAccount,
    openLanguage,
    closeLanguage,
    showLanguageSheet,
    language,
    handlePickLanguage,
  };
}
