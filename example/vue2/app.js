/* eslint-disable no-undef, new-cap */

i18next.use(i18nextHttpBackend).init({
  debug: true,
  lng: 'en',
  fallbackLng: 'en',
  backend: {
    loadPath: './locales/{{lng}}/{{ns}}.json'
  }
}, () => {
  const i18n = new VueI18next(i18next);

  Vue.component('app', {
    template: `
    <div>
      <div>
          <h3>Translation</h3>
          <language-changer></language-changer>
          <p>$t: {{ $t("message.hello") }}</p>
      </div>
      <div>
        <h3>Interpolation</h3>
        <i18next path="term" tag="label" for="tos">
          <a href="#" target="_blank">{{ $t("tos") }}</a>
          <strong>a</strong>
        </i18next>
      </div>
      <div>
        <h3>Prefix</h3>
        <key-prefix></key-prefix>
      </div>
      <div>
        <h3>Inline translations</h3>
        <inline-translations></inline-translations>
      </div>
      <div>
        <h3>Directive</h3>
        <with-directive></with-directive>
      </div>
    </div>`,
  });

  Vue.component('language-changer', {
    template: `
      <div>
        <a v-on:click="changeLanguage('de')">DE</a>
        &nbsp;|&nbsp;
        <a v-on:click="changeLanguage('en')">EN</a>
      </div>`,
    methods: {
      changeLanguage(lang) {
        this.$i18n.i18next.changeLanguage(lang);
      },
    },
  });

  Vue.component('key-prefix', {
    i18nOptions: {
      keyPrefix: 'message',
    },
    template: `
      <div>
        <p>{{$t('hello')}}</p>
      </div>`,
  });

  Vue.component('inline-translations', {
    i18nOptions: {
      messages: {
        en: {
          welcome: 'Welcome!',
        },
        de: {
          welcome: 'Guten Tag!',
        },
      },
    },
    template: `
      <div>
        {{$t('welcome')}}
      </div>`,
  });

  Vue.component('with-directive', {
    template: `
      <div v-t="{path:'message.hello'}"></div>`,
  });

  new Vue({
    i18n,
  }).$mount('#app');
});