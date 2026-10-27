import expect from 'expect.js'
import request from '../lib/request.js'
import server from './fixtures/server.js'
import { hasXMLHttpRequest } from '../lib/utils.js'

describe(`request ${hasXMLHttpRequest() ? 'XMLHttpRequest' : 'fetch'}`, () => {
  before(server)

  if (hasXMLHttpRequest()) {
    it('reports a synchronous XMLHttpRequest error to the callback', async () => {
      const originalXHR = global.XMLHttpRequest
      global.XMLHttpRequest = class {
        open () { throw new Error('open failed') }
      }
      let receivedError
      try {
        const { default: requestWithFailingXHR } = await import('../lib/request.js?failing-xhr')
        requestWithFailingXHR({}, 'http://localhost:5001/locales/en/test', null, err => { receivedError = err })
      } finally {
        global.XMLHttpRequest = originalXHR
      }
      expect(receivedError).to.be.an(Error)
      expect(receivedError.message).to.be('open failed')
    })

    it('does not call back twice when the callback of an XMLHttpRequest completing inside send() throws', async () => {
      const originalXHR = global.XMLHttpRequest
      global.XMLHttpRequest = class {
        open () {}
        setRequestHeader () {}
        send () {
          this.readyState = 4
          this.status = 200
          this.responseText = '{}'
          this.onreadystatechange()
        }
      }
      let calls = 0
      let thrown
      try {
        const { default: requestWithSyncXHR } = await import('../lib/request.js?sync-xhr')
        requestWithSyncXHR({}, 'http://localhost:5001/locales/en/test', null, () => {
          calls++
          throw new Error('callback failed')
        })
      } catch (e) {
        thrown = e
      } finally {
        global.XMLHttpRequest = originalXHR
      }
      expect(calls).to.be(1)
      expect(thrown.message).to.be('callback failed')
    })
  }

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

    it('should add parameters before a URL fragment', (done) => {
      request({ queryStringParams: { version: '1.2.3' } }, 'http://localhost:5001/locales/en/testqs?existing=1#section', null, (err, ret) => {
        try {
          expect(err).not.to.be.ok()
          expect(JSON.parse(ret.data)).to.eql({ existing: '1', version: '1.2.3' })
          done()
        } catch (e) {
          done(e)
        }
      })
    })
  })
})
