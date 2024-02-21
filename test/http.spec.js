import expect from 'expect.js'
import Http from '../index.js'
import i18next from 'i18next'
import JSON5 from 'json5'
import server from './fixtures/server.js'
import { hasXMLHttpRequest } from '../lib/utils.js'

i18next.init()

describe(`http backend using ${hasXMLHttpRequest() ? 'XMLHttpRequest' : 'fetch'}`, () => {
  before(server)

  describe('#read', () => {
    let backend
    const logs = []

    before(function () {
      logs.splice(0)
      backend = new Http(
        {
          interpolator: i18next.services.interpolator
        },
        {
          loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}',
          alternateFetch: (url, requestInit) => {
            logs.push([url, requestInit])
            // not returning a promise olding actual data makes this a spy
            return undefined
          }
        }
      )
    })
    if (!hasXMLHttpRequest()) {
      it('should load data', async () => {
        let errO
        let dataO
        const done = await new Promise((resolve, reject) => {
          backend.read('en', 'test', (err, data) => {
            // dont check here with "except", if there is an error
            // because the test will just "hang" with no further info
            errO = err
            dataO = data
            resolve(true)
            setTimeout(() => reject(new Error('timeout')), 1500)
          })
        })
        // evaluate outside callback to get actuall error when something is wrong
        expect(errO).to.be(null)
        expect(dataO).to.eql({ key: 'passing' })
        expect(done).to.be(true)
        expect(logs).to.have.length(1)
        expect(logs[0]).to.have.length(2)
        expect(logs[0][0]).to.eql('http://localhost:5001/locales/en/test')
        expect(logs[0][1]).to.have.property('method', 'GET')
        expect(logs[0][1]).to.have.property('headers')
        expect(logs[0][1].headers).to.have.property('User-Agent')
        expect(logs[0][1]).to.have.property('mode', 'cors')
        expect(logs[0][1]).to.have.property('credentials', 'same-origin')
        expect(logs[0][1]).to.have.property('cache', 'default')
        expect(logs[0][1]).to.have.property('body')
      })
    }

    if (hasXMLHttpRequest()) {
      it('should load data', async () => {
        let errO
        let dataO
        const done = await new Promise((resolve, reject) => {
          backend.read('en', 'test', (err, data) => {
            // dont check here with "except", if there is an error
            // because the test will just "hang" with no further info
            errO = err
            dataO = data
            resolve(true)
            setTimeout(() => reject(new Error('timeout')), 1500)
          })
        })
        // evaluate outside callback to get actuall error when something is wrong
        expect(errO).to.be(null)
        expect(dataO).to.eql({ key: 'passing' })
        expect(done).to.be(true)
        // fetch was not used
        expect(logs).to.eql([])
      })
    }

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

  describe('with custom request function option', () => {
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

  if (!hasXMLHttpRequest()) {
    describe('with custom request options', () => {
      let backend

      before(() => {
        backend = new Http(
          {
            interpolator: i18next.services.interpolator
          },
          {
            loadPath: 'http://localhost:5001/locales/{{lng}}/{{ns}}',
            addPath: 'http://localhost:5001/create/{{lng}}/{{ns}}',
            requestOptions: {
              method: 'PATCH'
            }
          }
        )
      })

      describe('#read', () => {
        it('should read data', (done) => {
          backend.read('it', 'testns', function (err, data) {
            expect(err).not.to.be.ok()
            expect(data).to.eql({ via: 'patch' })
            done()
          })
        })
      })

      describe('#create', () => {
        it('should write data', (done) => {
          backend.create('it', 'testns', 'new.key', 'new value', (dataArray, resArray) => {
            expect(dataArray).to.eql([null])
            expect(resArray).to.eql([ { status: 200, data: '' } ])
            done()
          })
        })
      })
    })
  }

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
