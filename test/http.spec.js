import expect from 'expect.js'
import Http from '../index.js'
import i18next from 'i18next'
import JSON5 from 'json5'
import server from './fixtures/server.js'

i18next.init()

describe(`http backend using ${typeof XMLHttpRequest === 'function' ? 'XMLHttpRequest' : 'fetch'}`, () => {
  before(server)

  describe('#read', () => {
    let backend

    before(() => {
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}'
        }
      )
    })

    it('should load data', (done) => {
      backend.read('en', 'test', (err, data) => {
        expect(err).not.to.be.ok()
        expect(data).to.eql({ key: 'passing' })
        done()
      })
    })

    it('should throw error on not existing file', (done) => {
      backend.read('en', 'notexisting', (err, data) => {
        expect(err).to.equal('failed loading http://localhost:5001/locales/en/notexisting')
        done()
      })
    })

    it('should throw error on non json file', (done) => {
      backend.read('en', 'nonjson', function (err, data) {
        expect(err).to.equal(
          'failed parsing http://localhost:5001/locales/en/nonjson to json'
        )
        done()
      })
    })

    it('should load data on a stringified json file', (done) => {
      backend.read('en', 'test2', function (err, data) {
        expect(err).not.to.be.ok()
        expect(data).to.eql({ key: 'passing' })
        done()
      })
    })

    it('should load json5 data', (done) => {
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}',
          parse: JSON5.parse
        }
      )
      backend.read('en', 'test5', function (err, data) {
        expect(err).not.to.be.ok()
        expect(data).to.eql({ key: 'passing' })
        done()
      })
    })
    it('should load custom parser data', (done) => {
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}',
          parse: (data, lng, ns) => ({ ...JSON.parse(data), lng, ns })
        }
      )
      backend.read('en', 'test', function (err, data) {
        expect(err).not.to.be.ok()
        expect(data).to.eql({ key: 'passing', lng: 'en', ns: 'test' })
        done()
      })
    })
  })

  describe('with loadPath function', () => {
    let backend
    let calledLanguages = []
    let calledNamespaces = []
    const loadPathSpy = (languages, namespaces) => {
      calledLanguages = calledLanguages.concat(languages)
      calledNamespaces = calledNamespaces.concat(namespaces)
      return 'http://localhost:5001/locales/' + languages[0] + '/' + namespaces[0]
    }

    before(() => {
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          loadPath: loadPathSpy
        }
      )
    })

    describe('#read', () => {
      it('should load data', (done) => {
        backend.read('en', 'test', (err, data) => {
          expect(err).not.to.be.ok()
          expect(calledLanguages).to.eql(['en'])
          expect(calledNamespaces).to.eql(['test'])
          expect(data).to.eql({ key: 'passing' })
          done()
        })
      })
    })
  })
})
