// serve translations
import { Application } from 'https://deno.land/x/abc/mod.ts'
(new Application())
  .static('/locales', './locales')
  .start({ port: 8080 })

// i18next in action...
import i18next from 'https://deno.land/x/i18next/index.js'
// import i18next from 'https://raw.githubusercontent.com/i18next/i18next/master/src/index.js'
// import i18next from 'https://cdn.jsdelivr.net/gh/i18next/i18next/src/index.js'
import HttpBackend from 'https://deno.land/x/i18next_http_backend/index.js'
// import HttpBackend from 'https://raw.githubusercontent.com/i18next/i18next-http-backend/master/index.js'
// import HttpBackend from 'https://cdn.jsdelivr.net/gh/i18next/i18next-http-backend/index.js'
i18next.use(HttpBackend).init({
  lng: 'en',
  fallbackLng: 'en',
  preload: ['en', 'de'],
  ns: ['translation'],
  defaultNS: 'translation',
  backend: {
    loadPath: 'http://localhost:8080/locales/{{lng}}/{{ns}}.json'
  }
}, (err, t) => {
  if (err) return console.error(err)
  console.log(t('welcome'))
  console.log(t('welcome', { lng: 'de' }))
})
