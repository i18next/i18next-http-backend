import { assertEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import Http from '../../index.js'
import server from './fixtures/server.js'
const { test } = Deno

test('BackendConnector basic load', async () => {
  // before
  i18next.init()
  const connector = i18next.services.backendConnector
  connector.backend = new Http(i18next.services, {
    loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}'
  })
  const app = await server()

  // test
  await (new Promise((resolve, reject) => {
    connector.load(['en'], ['test'], (err) => err ? reject(err) : resolve())
  }))

  assertEquals(connector.store.getResourceBundle('en', 'test'), {
    key: 'passing'
  })

  // after
  await app.close()
})
