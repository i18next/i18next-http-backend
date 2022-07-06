import expect from 'expect.js'
import request from '../lib/request.js'
import server from './fixtures/server.js'
import { hasXMLHttpRequest } from '../lib/utils.js'

describe(`request ${hasXMLHttpRequest() ? 'XMLHttpRequest' : 'fetch'}`, () => {
  before(server)

  describe('#missing', () => {
    it('should load data', (done) => {
      request({ stringify: JSON.stringify }, 'http://localhost:5001/locales/missing/en/test', { key: 'new' }, (err) => {
        expect(err).not.to.be.ok()
        done()
      })
    })
  })

  describe('#load with queryStringParams', () => {
    it('should load data', (done) => {
      request({ queryStringParams: { version: '1.2.3' } }, 'http://localhost:5001/locales/en/testqs', null, (err, ret) => {
        expect(err).not.to.be.ok()
        expect(JSON.parse(ret.data)).to.eql({ version: '1.2.3' })
        done()
      })
    })
  })
})
