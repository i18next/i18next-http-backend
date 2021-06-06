import { createI18n } from './vue-i18next'
import i18nextMod from 'i18next'
import i18nextHttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

export const i18next = i18nextMod

export const i18nextPromise = i18next
  .use(LanguageDetector)
  .use(i18nextHttpBackend)
  .init({
    debug: true,
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json'
    }
  });

export const i18n = createI18n(i18next);
