# just like usual...

```js
import i18next from 'https://deno.land/x/i18next/index.js'

i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        welcome: 'hello world'
      }
    },
    de: {
      translation: {
        welcome: 'hallo welt'
      }
    }
  }
}, (err, t) => {
  if (err) return console.error(err)
  console.log(t('welcome')) // hello world
  console.log(t('welcome', { lng: 'de' })) // hallo welt
})
```

## example with http backend

```js
// serve translations
import { Application } from 'https://deno.land/x/abc/mod.ts'
(new Application())
  .static('/locales', './locales')
  .start({ port: 8080 })

// i18next in action...
import i18next from 'https://deno.land/x/i18next/index.js'
import HttpBackend from 'https://raw.githubusercontent.com/i18next/i18next-http-backend/master/index.js'

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
  console.log(t('welcome')) // hello world
  console.log(t('welcome', { lng: 'de' })) // hallo welt
})
```

### run the example (app.js) with:

```sh
deno --allow-net --allow-env --allow-read app.js
```