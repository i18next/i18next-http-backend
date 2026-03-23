# Loading translations via HTTP with next-i18next

This example shows how to use [i18next-http-backend](https://github.com/i18next/i18next-http-backend) with [next-i18next](https://github.com/i18next/next-i18next) v16 for loading translations via HTTP — in both the **Pages Router** and the **App Router** (mixed-router setup).

Three i18next backend plugins are used:
- [i18next-chained-backend](https://github.com/i18next/i18next-chained-backend) — chains multiple backends together
- [i18next-http-backend](https://github.com/i18next/i18next-http-backend) — loads translations via HTTP
- [i18next-localstorage-backend](https://github.com/i18next/i18next-localstorage-backend) — caches translations in localStorage

The chained backend tries localStorage first, then falls back to HTTP. If your translation responses send a `Cache-Control` header, you may not need the localStorage caching.

Please read the i18next [Add or Load Translations docs](https://www.i18next.com/how-to/add-or-load-translations) and [Caching docs](https://www.i18next.com/how-to/caching) for more on backend plugins.

## Setup

```bash
npm install next-i18next i18next react-i18next i18next-chained-backend i18next-http-backend i18next-localstorage-backend
```

## How it works

### Pages Router

On the server, translations are loaded from the filesystem via `serverSideTranslations()`. On the client, the chained backend loads translations from localStorage (with HTTP fallback):

```js
// next-i18next.config.js
const HttpBackend = require('i18next-http-backend/cjs')
const ChainedBackend = require('i18next-chained-backend')
const LocalStorageBackend = require('i18next-localstorage-backend')

const isBrowser = typeof window !== 'undefined'

module.exports = {
  backend: {
    backendOptions: [{ expirationTime: 60 * 60 * 1000 }, {}], // 1 hour
    backends: isBrowser ? [LocalStorageBackend, HttpBackend] : [],
  },
  partialBundledLanguages: isBrowser && true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  serializeConfig: false,
  use: isBrowser ? [ChainedBackend] : [],
}
```

Since the config contains non-serializable values (backend classes), pass it explicitly to `appWithTranslation`:

```js
// pages/_app.js
import { appWithTranslation } from 'next-i18next/pages'
import nextI18nConfig from '../next-i18next.config'

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />
export default appWithTranslation(MyApp, nextI18nConfig)
```

**Three usage patterns are demonstrated:**

1. **SSG + lazy reload** (recommended) — `getStaticProps` provides initial translations, then `reloadResources()` fetches fresh ones via HTTP:

```js
const LazyReloadPage = () => {
  const { t, i18n } = useTranslation(['lazy-reload-page', 'footer'], {
    bindI18n: 'languageChanged loaded',
  })
  useEffect(() => {
    i18n.reloadResources(i18n.resolvedLanguage, ['lazy-reload-page', 'footer'])
  }, [])

  return <h1>{t('h1')}</h1>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['lazy-reload-page', 'footer'])),
  },
})
```

2. **Pure client-side** — no `getStaticProps`, translations loaded entirely via HTTP. Use `ready` to avoid showing bare keys. Not recommended for SEO.

3. **Pure SSG** — standard `getStaticProps` with `serverSideTranslations`, no client-side reloading.

### App Router

The App Router pages live under `/app-router/[locale]/` and use `createProxy()` with `basePath: '/app-router'` so the proxy only handles App Router routes.

On the server, translations are loaded via `resourceLoader` (filesystem). On the client, `I18nProvider` is configured with the same chained backend for lazy-loading:

```js
// app/app-router/[locale]/layout.js
import { I18nProvider } from 'next-i18next/client'
import HttpBackend from 'i18next-http-backend'
import ChainedBackend from 'i18next-chained-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'

// In the layout, pass the chained backend to I18nProvider:
<I18nProvider
  language={locale}
  resources={resources}
  use={[ChainedBackend]}
  i18nextOptions={{
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        { expirationTime: isDev ? 0 : 60 * 60 * 1000 },
        {},
      ],
    },
  }}
>
  {children}
</I18nProvider>
```

Client Components use `useT()` — additional namespaces are lazy-loaded via HTTP:

```js
'use client'
import { useT } from 'next-i18next/client'

export default function ClientPage() {
  const { t } = useT('client-page')
  return <h1>{t('h1')}</h1>
}
```

Server Components use `getT()` as usual:

```js
import { getT } from 'next-i18next/server'

export default async function Page({ params }) {
  const { locale } = await params
  const { t } = await getT('common', { lng: locale })
  return <h1>{t('h1')}</h1>
}
```

## Running the example

```bash
npm install
npm run dev
```

- Pages Router pages: [http://localhost:3000](http://localhost:3000)
- App Router pages: [http://localhost:3000/app-router/en](http://localhost:3000/app-router/en)

## Related

- [next-i18next](https://github.com/i18next/next-i18next)
- [Blog post: next-i18next with http-backend in Next.js Pages Router](https://www.locize.com/blog/next-i18next/)
- [Blog post: i18n in Next.js App Router](https://www.locize.com/blog/i18n-next-app-router/)
