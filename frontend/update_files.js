const fs = require('fs');
const path = require('path');

const langs = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Spanish (ES)' },
  { code: 'fr', name: 'French (FR)' },
  { code: 'de', name: 'German (DE)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ur', name: 'Urdu' },
  { code: 'fa', name: 'Persian' }
];

// 1. Update i18n.js
let i18nContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

`;

for (const lang of langs) {
  i18nContent += `import ${lang.code} from './locales/${lang.code}.json';\n`;
}

i18nContent += `
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
`;
for (const lang of langs) {
  i18nContent += `            '${lang.name}': '${lang.code}',\n`;
}
i18nContent += `          };
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
`;
for (const lang of langs) {
  i18nContent += `      ${lang.code}: { translation: ${lang.code} },\n`;
}
i18nContent += `    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
`;

fs.writeFileSync(path.join(__dirname, 'i18n.js'), i18nContent);

// 2. Update AppSettingsScreen.js
const appSettingsPath = path.join(__dirname, 'screens', 'AppSettingsScreen.js');
let appSettings = fs.readFileSync(appSettingsPath, 'utf8');

// Replace the map in handleLanguageSelect
const mapRegex = /const map = \{[\s\S]*?\};/;
let newMap = `const map = {\n`;
for (const lang of langs) {
  newMap += `      '${lang.name}': '${lang.code}',\n`;
}
newMap += `    };`;
appSettings = appSettings.replace(mapRegex, newMap);

// Replace the array in the Modal
const arrayStr = `[${langs.map(l => `'${l.name}'`).join(', ')}]`;
const arrayRegex = /\{\['English \(US\)', 'Spanish \(ES\)', 'French \(FR\)', 'German \(DE\)'\]\.map/;
appSettings = appSettings.replace(arrayRegex, `{${arrayStr}.map`);

fs.writeFileSync(appSettingsPath, appSettings);

console.log('Files updated successfully!');
