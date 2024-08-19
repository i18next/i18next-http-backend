// serve translations
const express = require('express')
const app = express()
app.use('/locales', express.static('locales'))
app.listen(8080)

// i18next in action...
const i18next = require('i18next')
const HttpBackend = require('i18next-http-backend')
// const HttpBackend = require('../../cjs')
i18next.use(HttpBackend).init({
  lng: 'en',
  fallbackLng: 'en',
  preload: ['en', 'de'],
  ns: ['translation'],
  defaultNS: 'translation',
  backend: {
    loadPath: 'http://localhost:8080/locales/{{lng}}/{{ns}}.json'
    // loadPath: 'http://localhost:8081/locales/{{lng}}/{{ns}}.json'
  }
}, (err, t) => {
  // if (err) {
  //   i18next.options.backend.loadPath = 'http://localhost:8080/locales/{{lng}}/{{ns}}.json'
  //   i18next.services.backendConnector.backend.options.loadPath = 'http://localhost:8080/locales/{{lng}}/{{ns}}.json'
  //   i18next.reloadResources(['en', 'de'], null, (e) => {
  //     if (e) return console.error('after reload', e)
  //     console.log(t('welcome'))
  //     console.log(t('welcome', { lng: 'de' }))
  //   })
  //   return
  // }
  if (err) return console.error(err)
  console.log(t('welcome'))
  console.log(t('welcome', { lng: 'de' }))
})
