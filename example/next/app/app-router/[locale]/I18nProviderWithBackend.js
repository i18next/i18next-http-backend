'use client'

import { I18nProvider } from 'next-i18next/client'
import HttpBackend from 'i18next-http-backend'
import ChainedBackend from 'i18next-chained-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'

const isDev = process.env.NODE_ENV === 'development'

export function I18nProviderWithBackend({ children, language, resources, supportedLngs, defaultNS }) {
  return (
    <I18nProvider
      language={language}
      resources={resources}
      supportedLngs={supportedLngs}
      defaultNS={defaultNS}
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
  )
}
