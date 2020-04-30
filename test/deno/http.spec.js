import { assertEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import Http from '../../index.js'
import server from './fixtures/server.js'
const { test } = Deno

test('http backend', async () => {
  // before
  i18next.init()
  const backend = new Http(
    {
      interpolator: i18next.services.interpolator
    },
    {
      loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}'
    }
  )
  const app = await server()

  // test
  const data = await (new Promise((resolve, reject) => {
    backend.read('en', 'test', (err, data) => err ? reject(err) : resolve(data))
  }))
  assertEquals(data, {
    key: 'passing'
  })

  // this triggers: Error: Test case is leaking resources.
  // const err = await (new Promise((resolve, reject) => {
  //   backend.read('en', 'notexisting', (err, data) => err ? resolve(err) : reject(data))
  // }))
  // assertEquals(err, 'failed loading http://localhost:5001/locales/en/notexisting')

  const err2 = await (new Promise((resolve, reject) => {
    backend.read('en', 'nonjson', (err, data) => err ? resolve(err) : reject(data))
  }))
  assertEquals(err2, 'failed parsing http://localhost:5001/locales/en/nonjson to json')

  // after
  await app.close()
})
