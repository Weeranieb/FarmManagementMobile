import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import th from './th.json';

const fallback = 'th';
const locales = Localization.getLocales();
const deviceLang = locales[0]?.languageCode ?? fallback;

// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({
  resources: { th: { translation: th } },
  lng: deviceLang === 'th' ? 'th' : fallback,
  fallbackLng: fallback,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
