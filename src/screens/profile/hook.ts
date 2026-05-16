import { useCallback, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { useLanguage, type LanguageCode } from '@/screens/language';

const ACCOUNT_INFO_ROUTE = '/account-info' as unknown as Href;
const FEED_COLLECTION_ROUTE = '/feed-collection' as unknown as Href;

export function useProfileScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const username = user?.username ?? '';
  const { selected: language, pick: pickLanguage } = useLanguage();
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);

  const handleLogout = useCallback(async () => {
    await clearSession();
    router.replace('/(auth)/login');
  }, [clearSession, router]);

  const openAccount = useCallback(() => {
    router.push(ACCOUNT_INFO_ROUTE);
  }, [router]);

  const openFeedCollection = useCallback(() => {
    router.push(FEED_COLLECTION_ROUTE);
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
    openFeedCollection,
    openLanguage,
    closeLanguage,
    showLanguageSheet,
    language,
    handlePickLanguage,
  };
}
