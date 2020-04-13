import expect from 'expect.js'
import i18next from 'i18next'
import Http from '../index.js'
import server from './fixtures/server.js'

i18next.init()

describe(`BackendConnector basic load using ${typeof XMLHttpRequest === 'function' ? 'XMLHttpRequest' : 'fetch'}`, () => {
  let connector

  before((done) => {
    connector = i18next.services.backendConnector
    connector.backend = new Http(i18next.services, {
      loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}'
    })
    server(done)
  })

  describe('#load', () => {
    it('should load data', (done) => {
      connector.load(['en'], ['test'], (err) => {
        expect(err).not.to.be.ok()
        expect(connector.store.getResourceBundle('en', 'test')).to.eql({
          key: 'passing'
        })
        done()
      })
    })
  })
})
