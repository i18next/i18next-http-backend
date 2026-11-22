import i18next from 'i18next';
import Backend from 'i18next-http-backend';

i18next.use(Backend).init({
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
});

// create calls back with the errors and the responses of the requests to addPath
new Backend().create?.(['en'], 'translation', 'key', 'value', (errors, responses) => {
  errors.forEach(() => {});
  responses.forEach((response) => response?.status);
});
