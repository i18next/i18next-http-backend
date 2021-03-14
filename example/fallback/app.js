// serve translations
const express = require('express')
const app = express()
app.use('/locales', express.static('locales'))
app.listen(8080)

const localResources = {
  en: {
    translationFallback: {
      welcome: {
        from: {
          fallback: 'hello world from local fallback'
        }
      }
    }
  },
  de: {
    translationFallback: {
      welcome: {
        from: {
          fallback: 'hallo welt vom lokalen fallback'
        }
      }
    }
  }
}

const customLocalBackend = {
  type: 'backend',
  init: function(services, backendOptions, i18nextOptions) { /* use services and options */ },
  read: function(language, namespace, callback) {
    callback(null, localResources[language][namespace]);
  }
}

// i18next in action...
const i18next = require('i18next')
const HttpBackend = require('i18next-http-backend')
// const HttpBackend = require('../../cjs')
const ChainedBackend = require('i18next-chained-backend')
i18next.use(ChainedBackend).init({
  debug: true,
  lng: 'en',
  fallbackLng: 'en',
  preload: ['en', 'de'],
  ns: ['translation', 'translationFallback'],
  defaultNS: 'translation',
  backend: {
    backends: [
      HttpBackend, // if a namespace can't be loaded via normal http-backend loadPath, then the customLocalBackend will try to return the correct resources
      customLocalBackend
    ],
    backendOptions: [{
      loadPath: 'http://localhost:8080/locales/{{lng}}/{{ns}}.json'
    }, {}]
  }
}, (err, t) => {
  if (err) return console.error(err)
  console.log(t('welcome'))
  console.log(t('welcome', { lng: 'de' }))
  console.log(t('welcome.from.fallback', { ns: 'translationFallback' }))
  console.log(t('welcome.from.fallback', { lng: 'de', ns: 'translationFallback' }))
})
