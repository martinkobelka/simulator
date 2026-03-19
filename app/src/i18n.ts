import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import cs from './locales/cs/translation.json';
import en from './locales/en/translation.json';
import sk from './locales/sk/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      cs: { translation: cs },
      en: { translation: en },
      sk: { translation: sk },
    },
    load: 'languageOnly',
    fallbackLng: 'cs',
    interpolation: {
      escapeValue: false,
    },
  });
