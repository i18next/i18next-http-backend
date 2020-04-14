import expect from 'expect.js'
import request from '../lib/request.js'
import server from './fixtures/server.js'

describe(`request ${typeof XMLHttpRequest === 'function' ? 'XMLHttpRequest' : 'fetch'}`, () => {
  before(server)

  describe('#load', () => {
    it('should load data', (done) => {
      request({ stringify: JSON.stringify }, 'http://localhost:5001/locales/missing/en/test', { key: 'new' }, (err) => {
        expect(err).not.to.be.ok()
        done()
      })
    })
  })
})
