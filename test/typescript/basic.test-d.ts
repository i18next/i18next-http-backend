import i18next from 'i18next';
import Backend from 'i18next-http-backend';

i18next.use(Backend).init({
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
});
