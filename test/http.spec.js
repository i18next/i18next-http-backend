import expect from 'expect.js'
import Http from '../index.js'
import i18next from 'i18next'
import JSON5 from 'json5'
import server from './fixtures/server.js'
import { hasXMLHttpRequest } from '../lib/utils.js'

i18next.init()

describe(`http backend using ${hasXMLHttpRequest ? 'XMLHttpRequest' : 'fetch'}`, () => {
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
        try {
          expect(err).to.equal('failed loading http://localhost:5001/locales/en/notexisting; status code: 404')
          done()
        } catch (e) {
          done(e)
        }
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

  describe('with loadPath function (promise)', () => {
    let backend
    let calledLanguages = []
    let calledNamespaces = []
    const loadPathSpy = (languages, namespaces) => {
      calledLanguages = calledLanguages.concat(languages)
      calledNamespaces = calledNamespaces.concat(namespaces)

      return new Promise((resolve) => {
        resolve('http://localhost:5001/locales/' + languages[0] + '/' + namespaces[0])
      })
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

  describe('with custom request option', () => {
    let backend, requestCall

    before(() => {
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          loadPath: '/some/crazy/{{lng}}/{{ns}}/path',
          request: (options, url, payload, callback) => {
            requestCall = {
              options, url, payload
            }
            if (payload) { // is POST...
              return callback(null, { status: 200, data: '' })
            }
            callback(null, { status: 200, data: { myTranslationKey: 'my translation value' } })
            // callback(null, { status: 200, data: JSON.stringify({ myTranslationKey: 'my translation value' }) })
          }
        }
      )
    })

    describe('#read', () => {
      it('should read data', (done) => {
        backend.read('de', 'testns', function (err, data) {
          expect(err).not.to.be.ok()
          expect(data).to.eql({ myTranslationKey: 'my translation value' })
          expect(requestCall.options.loadPath).to.eql('/some/crazy/{{lng}}/{{ns}}/path')
          expect(requestCall.url).to.eql('/some/crazy/de/testns/path')
          expect(requestCall.payload).to.eql(undefined)
          done()
        })
      })
    })

    describe('#create', () => {
      it('should write data', (done) => {
        backend.create('en', 'test', 'new.key', 'new value', (dataArray, resArray) => {
          expect(requestCall.options.addPath).to.eql('/locales/add/{{lng}}/{{ns}}')
          expect(requestCall.url).to.eql('/locales/add/en/test')
          expect(requestCall.payload).to.eql({ 'new.key': 'new value' })

          expect(dataArray).to.eql([null])
          expect(resArray).to.eql([ { status: 200, data: '' } ])
          done()
        })
      })
    })
  })

  describe('with loadPath function returning falsy', () => {
    let backend
    let calledLanguages = []
    let calledNamespaces = []
    const loadPathSpy = (languages, namespaces) => {
      calledLanguages = calledLanguages.concat(languages)
      calledNamespaces = calledNamespaces.concat(namespaces)
      return ''
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
      it('should not load data', (done) => {
        backend.read('en', 'test', (err, data) => {
          expect(err).not.to.be.ok()
          expect(calledLanguages).to.eql(['en'])
          expect(calledNamespaces).to.eql(['test'])
          expect(data).to.eql({})
          done()
        })
      })
    })
  })

  describe('with addPath function', () => {
    let backend
    const calledLanguages = []
    const calledNamespaces = []
    const addPathSpy = (language, namespace) => {
      calledLanguages.push(language)
      calledNamespaces.push(namespace)
      return 'http://localhost:5001/locales/addCustom/' + language + '/' + namespace
    }

    before(() => {
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          addPath: addPathSpy
        }
      )
    })

    describe('#create', () => {
      it('should write data', (done) => {
        backend.create('en', 'test', 'key', 'value', (dataArray, resArray) => {
          try {
            expect(calledLanguages).to.eql(['en'])
            expect(calledNamespaces).to.eql(['test'])
            expect(dataArray).to.eql([null])
            expect(resArray).to.eql([ { status: 200, data: '' } ])
            done()
          } catch (e) {
            done(e)
          }
        })
      })
    })
  })
})
