import { initServerI18next, getT, getResources } from 'next-i18next/server'
import { I18nProviderWithBackend } from './I18nProviderWithBackend'
import i18nConfig from '../../../i18n.config'

initServerI18next(i18nConfig)

export default async function AppRouterLayout({ children, params }) {
  const { locale } = await params
  const { i18n } = await getT('common', { lng: locale })
  const resources = getResources(i18n, i18nConfig.ns)

  return (
    <html lang={locale}>
      <head>
        <link href='/app.css' rel='stylesheet' />
        <link href='https://cdnjs.cloudflare.com/ajax/libs/typicons/2.0.9/typicons.min.css' rel='stylesheet' />
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,400|Oswald:600' rel='stylesheet' />
      </head>
      <body>
        <I18nProviderWithBackend
          language={locale}
          resources={resources}
          supportedLngs={i18nConfig.supportedLngs}
          defaultNS={i18nConfig.defaultNS}
        >
          {children}
        </I18nProviderWithBackend>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }))
}
