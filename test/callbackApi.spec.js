import expect from 'expect.js'
import Http from '../index.js'

// i18next >= 26.7: a declared calling convention, and services.utils.reloadResources for reload()
describe('http backend with i18next 26.7', () => {
  it('declares the callback form', () => {
    expect(Http.callbackApi).to.be(true)
  })

  it('hands the reload to services.utils.reloadResources when i18next provides it', () => {
    const calls = []
    const backend = new Http()
    backend.services = {
      backendConnector: {},
      languageUtils: { toResolveHierarchy: (lng) => (lng ? [lng] : ['en']) },
      utils: { reloadResources: (...args) => calls.push(args) }
    }
    backend.allOptions = { ns: ['translation'], preload: ['de'] }
    backend.reload()
    // i18next >= 26.7.1 decides what to reload: everything it loaded or tried through the backend
    expect(calls).to.eql([[]])
  })
})
