import request from '../../lib/request.js'
import server from './fixtures/server.js'
const { test } = Deno

test('request', async () => {
  // before
  const app = await server()

  // test
  await (new Promise((resolve, reject) => {
    request({ stringify: JSON.stringify }, 'http://localhost:5001/locales/missing/en/test', { key: 'new' }, (err) => err ? reject(err) : resolve())
  }))

  // after
  await app.close()
})
