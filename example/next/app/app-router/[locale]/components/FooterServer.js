import { getT } from 'next-i18next/server'
import pkg from 'next-i18next/package.json'

export async function FooterServer({ locale }) {
  const { t } = await getT('footer', { lng: locale })

  return (
    <footer>
      <p>{t('description')}</p>
      <p>
        next-i18next v{pkg.version}
      </p>
    </footer>
  )
}
