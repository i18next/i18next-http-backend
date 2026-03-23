const HttpBackendModule = require('i18next-http-backend/cjs')
const ChainedBackendModule = require('i18next-chained-backend')
const LocalStorageBackendModule = require('i18next-localstorage-backend')

// Handle ESM/CJS interop — Turbopack may wrap CJS exports in { default: ... }
const HttpBackend = HttpBackendModule.default || HttpBackendModule
const ChainedBackend = ChainedBackendModule.default || ChainedBackendModule
const LocalStorageBackend = LocalStorageBackendModule.default || LocalStorageBackendModule

const isBrowser = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  debug: isDev,
  backend: {
    backendOptions: [{ expirationTime: isDev ? 0 : 60 * 60 * 1000 }, {}], // 1 hour
    backends: isBrowser ? [LocalStorageBackend, HttpBackend] : []
  },
  partialBundledLanguages: isBrowser && true,
  // react: { // used only for the lazy reload
  //   bindI18n: 'languageChanged loaded',
  //   useSuspense: false
  // },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de']
  },
  serializeConfig: false,
  use: isBrowser ? [ChainedBackend] : []
}
