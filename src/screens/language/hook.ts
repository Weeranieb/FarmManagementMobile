import { useCallback, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import i18n from '@/locale/i18n';

export type LanguageCode = 'th' | 'en';

const STORAGE_KEY = 'farmos.app.language';

export function useLanguage() {
  const [selected, setSelected] = useState<LanguageCode>(
    (i18n.language === 'en' ? 'en' : 'th') as LanguageCode,
  );

  const pick = useCallback(async (code: LanguageCode) => {
    setSelected(code);
    await i18n.changeLanguage(code);
    SecureStore.setItemAsync(STORAGE_KEY, code).catch(() => {});
  }, []);

  return { selected, pick };
}

export async function restoreSavedLanguage(): Promise<void> {
  try {
    const saved = await SecureStore.getItemAsync(STORAGE_KEY);
    if (saved === 'th' || saved === 'en') {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // ignore
  }
}
