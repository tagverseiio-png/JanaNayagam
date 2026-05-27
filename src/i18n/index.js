import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import taTranslations from './ta.json';

const savedLanguage = localStorage.getItem('jn_lng') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ta: {
        translation: taTranslations
      }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Keep local storage in sync when language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('jn_lng', lng);
});

export default i18n;
