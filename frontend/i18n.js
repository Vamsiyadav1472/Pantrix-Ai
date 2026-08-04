import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import ko from './locales/ko.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import tr from './locales/tr.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import tl from './locales/tl.json';
import sw from './locales/sw.json';
import ur from './locales/ur.json';
import fa from './locales/fa.json';

const LANGUAGE_KEY = 'appSettings_1';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedSettings = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.language) {
          const map = {
            'English (US)': 'en',
            'Spanish (ES)': 'es',
            'French (FR)': 'fr',
            'German (DE)': 'de',
            'Hindi': 'hi',
            'Telugu': 'te',
            'Tamil': 'ta',
            'Chinese': 'zh',
            'Japanese': 'ja',
            'Arabic': 'ar',
            'Portuguese': 'pt',
            'Russian': 'ru',
            'Bengali': 'bn',
            'Marathi': 'mr',
            'Gujarati': 'gu',
            'Kannada': 'kn',
            'Malayalam': 'ml',
            'Korean': 'ko',
            'Italian': 'it',
            'Dutch': 'nl',
            'Polish': 'pl',
            'Turkish': 'tr',
            'Vietnamese': 'vi',
            'Thai': 'th',
            'Indonesian': 'id',
            'Malay': 'ms',
            'Tagalog': 'tl',
            'Swahili': 'sw',
            'Urdu': 'ur',
            'Persian': 'fa',
          };
          const lang = map[parsed.language] || 'en';
          callback(lang);
          return;
        }
      }
    } catch (e) {
      console.log('Error detecting language', e);
    }
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      hi: { translation: hi },
      te: { translation: te },
      ta: { translation: ta },
      zh: { translation: zh },
      ja: { translation: ja },
      ar: { translation: ar },
      pt: { translation: pt },
      ru: { translation: ru },
      bn: { translation: bn },
      mr: { translation: mr },
      gu: { translation: gu },
      kn: { translation: kn },
      ml: { translation: ml },
      ko: { translation: ko },
      it: { translation: it },
      nl: { translation: nl },
      pl: { translation: pl },
      tr: { translation: tr },
      vi: { translation: vi },
      th: { translation: th },
      id: { translation: id },
      ms: { translation: ms },
      tl: { translation: tl },
      sw: { translation: sw },
      ur: { translation: ur },
      fa: { translation: fa },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
