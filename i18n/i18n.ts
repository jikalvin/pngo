import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
// import en from './locales/en.json';
// import es from './locales/es.json';
import en from './translations/en';
import es from './translations/es';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: Localization.locale.split('-')[0], // Use device locale
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: [],
    },
  });

export default i18n;
