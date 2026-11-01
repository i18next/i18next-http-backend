import expect from 'expect.js'
import Http from '../index.js'

// i18next >= 26.7: a declared calling convention, and services.utils.reloadResources for reload()
describe('http backend with i18next 26.7', () => {
  it('declares the callback form', () => {
    expect(Http.callbackApi).to.be(true)
  })

  it('reloads through services.utils.reloadResources when i18next provides it', () => {
    const calls = []
    const backend = new Http()
    backend.services = {
      backendConnector: {},
      languageUtils: { toResolveHierarchy: (lng) => (lng ? [lng] : ['en']) },
      utils: { reloadResources: (lngs, ns) => calls.push([lngs, ns]) }
    }
    backend.allOptions = { ns: ['translation'], preload: ['de'] }
    backend.reload()
    expect(calls).to.eql([[['en', 'de'], ['translation']]])
  })
})
