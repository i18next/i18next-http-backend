import { assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import { Application } from 'https://deno.land/x/abc/mod.ts'
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const server = async () => {
  const app = new Application()
  app.get('/locales/en/test', (c) => {
    return {
      key: 'passing'
    }
  })
  app.get('/locales/en/nonjson', (c) => {
    return '<div>sorry no json file</div>'
  })
  app.get('/locales/en/test5', (c) => {
    return `{ // this is json5, comments is stripped
      key: "passing"  // keys can be without ""
    }`
  })
  app.post('/locales/missing/en/test', (c) => {
    assertNotEquals(c.request.body, {})
    return {}
  })

  await wait(100)
  await app.start({ port: 5001 })
  return app
}

export default server
