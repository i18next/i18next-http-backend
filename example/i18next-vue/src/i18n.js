import I18NextVue from 'i18next-vue';
import i18next from 'i18next'
import i18nextHttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

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

export default function (app) {
  app.use(I18NextVue, { i18next });
}