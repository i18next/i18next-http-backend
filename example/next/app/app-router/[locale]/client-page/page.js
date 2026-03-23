'use client'

import { useT } from 'next-i18next/client'
import { useState } from 'react'

export default function ClientPage() {
  const { t } = useT('client-page')
  const [counter, setCounter] = useState(0)

  return (
    <>
      <main>
        <h2>
          next-i18next + i18next-http-backend
          <hr />
        </h2>
        <h1>{t('h1')}</h1>
        <p style={{ opacity: 0.65, fontStyle: 'italic' }}>
{t('description')}
        </p>
        <p>{t('counter', { count: counter })}</p>
        <div>
          <button onClick={() => setCounter(Math.max(0, counter - 1))}>-</button>
          <button onClick={() => setCounter(Math.min(10, counter + 1))}>+</button>
        </div>
        <div>
          <a href='../'>
            <button type='button'>{t('back-to-home')}</button>
          </a>
        </div>
      </main>
    </>
  )
}
