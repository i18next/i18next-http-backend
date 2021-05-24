// serve translations
const express = require('express')
const app = express()
app.use('/locales', express.static('locales'))
const server = app.listen(8080)

const resourcesToBackend = require('i18next-resources-to-backend')

const localResources = {
  en: {
    translation: {
      welcome: 'hello world from local fallback'
    }
  },
  de: {
    translation: {
      welcome: 'hallo welt vom lokalen fallback'
    }
  }
}

// i18next in action...
const i18next = require('i18next')
const ChainedBackend = require('i18next-chained-backend')
const HttpBackend = require('i18next-http-backend')
// const HttpBackend = require('../../cjs')

const initI18next = (cb) => {
  const i18n = i18next.createInstance()
  i18n.use(ChainedBackend).init({
    // debug: true,
    lng: 'en',
    fallbackLng: 'en',
    preload: ['en', 'de'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      backends: [
        HttpBackend, // if a namespace can't be loaded via normal http-backend loadPath, then the inMemoryLocalBackend will try to return the correct resources
        resourcesToBackend(localResources)
      ],
      backendOptions: [{
        loadPath: 'http://localhost:8080/locales/{{lng}}/{{ns}}.json'
      }]
    }
  }, cb)
}

initI18next((err, t) => {
  if (err) return console.error(err)
  console.log(t('welcome'))
  console.log(t('welcome', { lng: 'de' }))
  console.log('stopping http server...')
  server.close(() => {
    console.log('http server stopped')
    initI18next((err, t) => {
      if (err) return console.error(err)
      console.log(t('welcome'))
      console.log(t('welcome', { lng: 'de' }))
    })
  })
})
