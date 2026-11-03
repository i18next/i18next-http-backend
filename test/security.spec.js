import expect from 'expect.js'
import Backend from '../lib/index.js'
import {
  interpolate,
  interpolateUrl,
  isSafeLangUrlSegment,
  isSafeNsUrlSegment,
  isSafeUrlSegment,
  sanitizeLogValue,
  redactUrlCredentials
} from '../lib/utils.js'

// Security tests for fixes shipped in 3.0.5, plus 3.0.6 regression fix
// (nested namespaces with `/` were being wrongly rejected). See CHANGELOG.

describe('security', () => {
  describe('isSafeLangUrlSegment (strict — for `lng`)', () => {
    it('accepts arbitrary language-code shapes (i18next permits any shape)', () => {
      expect(isSafeLangUrlSegment('en')).to.be(true)
      expect(isSafeLangUrlSegment('de-DE')).to.be(true)
      expect(isSafeLangUrlSegment('en_US')).to.be(true)
      expect(isSafeLangUrlSegment('zh-Hant-HK')).to.be(true)
      expect(isSafeLangUrlSegment('pirate-speak')).to.be(true)
      expect(isSafeLangUrlSegment('my-custom.ns')).to.be(true)
    })

    it('rejects path-traversal / URL-structure / control-char payloads', () => {
      expect(isSafeLangUrlSegment('../etc/passwd')).to.be(false)
      expect(isSafeLangUrlSegment('..')).to.be(false)
      expect(isSafeLangUrlSegment('foo/bar')).to.be(false)
      expect(isSafeLangUrlSegment('foo\\bar')).to.be(false)
      expect(isSafeLangUrlSegment('en?admin=true')).to.be(false)
      expect(isSafeLangUrlSegment('en#frag')).to.be(false)
      expect(isSafeLangUrlSegment('en%2F..')).to.be(false)
      expect(isSafeLangUrlSegment('en user')).to.be(false)
      expect(isSafeLangUrlSegment('en@evil.com')).to.be(false)
      expect(isSafeLangUrlSegment('http:127.0.0.1:8080')).to.be(false)
      expect(isSafeLangUrlSegment('__proto__')).to.be(false)
      expect(isSafeLangUrlSegment('en\r\nX-Injected: bad')).to.be(false)
      expect(isSafeLangUrlSegment('')).to.be(false)
      expect(isSafeLangUrlSegment('a'.repeat(200))).to.be(false)
    })

    it('is still exported as `isSafeUrlSegment` for 3.0.5 backwards compat', () => {
      expect(isSafeUrlSegment).to.be(isSafeLangUrlSegment)
    })
  })

  describe('isSafeNsUrlSegment (loose — for `ns`, allows `/` and `@`)', () => {
    it('accepts nested and scoped-package-style namespace names', () => {
      expect(isSafeNsUrlSegment('a/b')).to.be(true)
      expect(isSafeNsUrlSegment('foo/bar/baz')).to.be(true)
      expect(isSafeNsUrlSegment('common')).to.be(true)
      // https://github.com/i18next/i18next-http-backend/issues/191
      expect(isSafeNsUrlSegment('@organization/package-name')).to.be(true)
    })

    it('still rejects every concrete attack pattern from the 3.0.5 advisory', () => {
      expect(isSafeNsUrlSegment('..')).to.be(false)
      expect(isSafeNsUrlSegment('../etc/passwd')).to.be(false)
      expect(isSafeNsUrlSegment('a/../b')).to.be(false)
      expect(isSafeNsUrlSegment('foo\\bar')).to.be(false)
      expect(isSafeNsUrlSegment('ns?admin=true')).to.be(false)
      expect(isSafeNsUrlSegment('ns#frag')).to.be(false)
      expect(isSafeNsUrlSegment('ns%2F..')).to.be(false)
      expect(isSafeNsUrlSegment('http:127.0.0.1:8080/x')).to.be(false)
      expect(isSafeNsUrlSegment('//evil.example/x')).to.be(false)
      expect(isSafeNsUrlSegment('a//b')).to.be(false)
      expect(isSafeNsUrlSegment('__proto__')).to.be(false)
      expect(isSafeNsUrlSegment('ns\r\n')).to.be(false)
      expect(isSafeNsUrlSegment('')).to.be(false)
      expect(isSafeNsUrlSegment('a'.repeat(200))).to.be(false)
    })
  })

  describe('interpolate', () => {
    it('does not pollute Object.prototype via __proto__ key in data', () => {
      // interpolate is not a mutation API (it just reads data[key]) but we
      // still guard the key name to prevent surprising behaviour from a
      // polluted template.
      const out = interpolate('x {{__proto__}} y', { __proto__: { polluted: true } })
      // The placeholder is returned unchanged (no substitution for unsafe keys)
      expect(out).to.equal('x {{__proto__}} y')
      expect(({}).polluted).to.be(undefined)
    })

    it('still substitutes safe keys', () => {
      expect(interpolate('hi {{name}}', { name: 'world' })).to.equal('hi world')
    })
  })

  describe('interpolateUrl', () => {
    it('accepts plain codes and multi-lang + joins', () => {
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: 'common' }))
        .to.equal('/locales/en/common.json')
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en+de', ns: 'a+b' }))
        .to.equal('/locales/en+de/a+b.json')
    })

    it('returns null for path-traversal values', () => {
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: '../etc/passwd', ns: 'x' }))
        .to.equal(null)
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: '..' }))
        .to.equal(null)
    })

    it('returns null for URL-structure injection (query-string, fragment)', () => {
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en?admin=true', ns: 'x' }))
        .to.equal(null)
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en#frag', ns: 'x' }))
        .to.equal(null)
    })

    it('accepts nested ns with `/` (3.0.6 regression fix)', () => {
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: 'a/b' }))
        .to.equal('/locales/en/a/b.json')
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: 'foo/bar/baz' }))
        .to.equal('/locales/en/foo/bar/baz.json')
    })

    it('still returns null for ns with `..` or `\\` — nested ns does not weaken the fix', () => {
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: 'a/../b' }))
        .to.equal(null)
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: '..' }))
        .to.equal(null)
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: 'a\\b' }))
        .to.equal(null)
    })

    it('still rejects `/` in lng (strict)', () => {
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en/foo', ns: 'x' }))
        .to.equal(null)
    })

    it('returns null when any segment of a multi-lang + join is unsafe', () => {
      expect(interpolateUrl('/locales/{{lng}}.json', { lng: 'en+../etc/passwd' }))
        .to.equal(null)
    })

    // GHSA-xvq9-wjp8-hwqf: with a template that starts with the placeholder
    // (no origin / leading path), a `scheme:` or `//` prefix in the value
    // turns the interpolated string into an absolute / protocol-relative URL.
    it('returns null for scheme or protocol-relative injection when the placeholder leads the template', () => {
      expect(interpolateUrl('{{lng}}/{{ns}}.json', { lng: 'http:127.0.0.1:8080', ns: 'common' }))
        .to.equal(null)
      expect(interpolateUrl('{{ns}}/{{lng}}.json', { lng: 'en', ns: 'http:127.0.0.1:8080/x' }))
        .to.equal(null)
      expect(interpolateUrl('{{ns}}/{{lng}}.json', { lng: 'en', ns: '//evil.example/x' }))
        .to.equal(null)
      expect(interpolateUrl('{{lng}}/{{ns}}.json', { lng: 'en+http:127.0.0.1:8080', ns: 'common' }))
        .to.equal(null)
    })

    // GHSA-9jhj-wvmw-cfx5: a leading `/` in ns joins the template's own `/`
    // into `//`, which the per-value `//` check cannot see.
    it('returns null when the template `/` plus a leading `/` in the value form a protocol-relative URL', () => {
      expect(interpolateUrl('/{{ns}}/{{lng}}.json', { lng: 'en', ns: '/evil.example' }))
        .to.equal(null)
      expect(interpolateUrl('/{{ns}}/{{lng}}.json', { lng: 'en', ns: '/@evil.example' }))
        .to.equal(null)
      expect(interpolateUrl('/{{ns}}/{{lng}}.json', { lng: 'evil', ns: '/' }))
        .to.equal(null)
      expect(interpolateUrl('\\{{ns}}/{{lng}}.json', { lng: 'en', ns: '/evil.example' }))
        .to.equal(null)
    })

    it('still allows a protocol-relative template and a leading `/` in ns after an origin', () => {
      expect(interpolateUrl('//cdn.example/{{lng}}/{{ns}}.json', { lng: 'en', ns: 'a/b' }))
        .to.equal('//cdn.example/en/a/b.json')
      expect(interpolateUrl('/{{ns}}/{{lng}}.json', { lng: 'en', ns: 'a/b' }))
        .to.equal('/a/b/en.json')
      expect(interpolateUrl('https://cdn.example/{{ns}}/{{lng}}.json', { lng: 'en', ns: '/x' }))
        .to.equal('https://cdn.example//x/en.json')
    })

    // GHSA-3cmx-xjww-583x: with a query-shaped template, `&` / `=` / `;` in
    // a value add or override query parameters.
    it('returns null for query-parameter injection in a query-shaped template', () => {
      const t = '/locales/resources.json?lng={{lng}}&ns={{ns}}'
      expect(interpolateUrl(t, { lng: 'de&ns=private&admin=true', ns: 'common' })).to.equal(null)
      expect(interpolateUrl(t, { lng: 'de', ns: 'common&admin=true' })).to.equal(null)
      expect(interpolateUrl(t, { lng: 'de;admin=true', ns: 'common' })).to.equal(null)
      expect(interpolateUrl(t, { lng: 'de+en=x', ns: 'common' })).to.equal(null)
      // the documented multiload shape keeps working
      expect(interpolateUrl(t, { lng: 'de+en', ns: 'ns1+ns2' }))
        .to.equal('/locales/resources.json?lng=de+en&ns=ns1+ns2')
    })

    // GHSA-qh2f-jh77-hfwf: with a template that puts the placeholder in the
    // host, `@` (userinfo delimiter) or `/` (end of the authority) in the
    // value sends the request to another host.
    it('returns null when a value changes the host of the template', () => {
      const t = 'https://{{ns}}.cdn.example.com/{{lng}}.json'
      expect(interpolateUrl(t, { lng: 'en', ns: '@evil.example/x' })).to.equal(null)
      expect(interpolateUrl(t, { lng: 'en', ns: 'evil.example/x' })).to.equal(null)
      expect(interpolateUrl(t, { lng: 'en', ns: 'evil.example@x' })).to.equal(null)
      expect(interpolateUrl(t, { lng: 'en', ns: 'common+@evil.example/x' })).to.equal(null)
      expect(interpolateUrl('//{{ns}}.cdn.example.com/{{lng}}.json', { lng: 'en', ns: '@evil.example/x' })).to.equal(null)
    })

    it('still allows plain values in the host and `@` / `/` in the path', () => {
      expect(interpolateUrl('https://{{ns}}.cdn.example.com/{{lng}}.json', { lng: 'en', ns: 'common' }))
        .to.equal('https://common.cdn.example.com/en.json')
      expect(interpolateUrl('https://{{lng}}.cdn.example.com/{{ns}}.json', { lng: 'de-CH', ns: '@org/pkg' }))
        .to.equal('https://de-CH.cdn.example.com/@org/pkg.json')
      expect(interpolateUrl('https://cdn.example.com/{{lng}}/{{ns}}.json', { lng: 'en', ns: '@org/pkg' }))
        .to.equal('https://cdn.example.com/en/@org/pkg.json')
      expect(interpolateUrl('/locales/{{lng}}/{{ns}}.json', { lng: 'en', ns: '@org/pkg' }))
        .to.equal('/locales/en/@org/pkg.json')
      expect(interpolateUrl('{{ns}}/{{lng}}.json', { lng: 'en', ns: '@org/pkg' }))
        .to.equal('@org/pkg/en.json')
    })

    it('ignores __proto__ placeholder', () => {
      expect(interpolateUrl('/{{__proto__}}/x', { __proto__: { a: 1 } }))
        .to.equal('/{{__proto__}}/x')
    })
  })

  describe('Backend.read with a leading-placeholder loadPath (GHSA-xvq9-wjp8-hwqf)', () => {
    it('refuses to issue the request for a scheme-injecting lng', (done) => {
      let fetched = false
      const backend = new Backend(null, {
        loadPath: '{{lng}}/{{ns}}.json',
        alternateFetch: (url) => { fetched = true; return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{}') }) }
      })
      backend.read('http:127.0.0.1:8080', 'common', (err, data) => {
        expect(fetched).to.be(false)
        expect(err).to.be.an(Error)
        expect(err.message).to.contain('unsafe lng/ns value')
        expect(data).to.be(false)
        done()
      })
    })

    it('refuses to issue the request for an ns that turns `/{{ns}}` into `//host` (GHSA-9jhj-wvmw-cfx5)', (done) => {
      let fetched = false
      const backend = new Backend(null, {
        loadPath: '/{{ns}}/{{lng}}.json',
        alternateFetch: (url) => { fetched = true; return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{}') }) }
      })
      backend.read('en', '/evil.example', (err, data) => {
        expect(fetched).to.be(false)
        expect(err).to.be.an(Error)
        expect(err.message).to.contain('unsafe lng/ns value')
        expect(data).to.be(false)
        done()
      })
    })
  })

  describe('Backend with {{ns}} in the host of loadPath / addPath (GHSA-qh2f-jh77-hfwf)', () => {
    const requestInto = (urls) => (options, url, payload, callback) => {
      urls.push(url)
      callback(null, { status: 200, data: '{}' })
    }

    it('read refuses an ns that moves the request to another host, for string and function loadPath', (done) => {
      const urls = []
      const options = { request: requestInto(urls) }
      const backend = new Backend(null, { ...options, loadPath: 'https://{{ns}}.cdn.example.com/{{lng}}.json' })
      const fnBackend = new Backend(null, { ...options, loadPath: () => 'https://{{ns}}.cdn.example.com/{{lng}}.json' })
      backend.read('en', '@evil.example/x', (err, data) => {
        expect(err.message).to.contain('unsafe lng/ns value')
        expect(data).to.be(false)
        fnBackend.read('en', 'evil.example/x', (err, data) => {
          expect(err.message).to.contain('unsafe lng/ns value')
          expect(data).to.be(false)
          expect(urls).to.eql([])
          done()
        })
      })
    })

    it('create refuses it too', (done) => {
      const urls = []
      const backend = new Backend(null, { addPath: 'https://{{ns}}.cdn.example.com/add/{{lng}}', request: requestInto(urls) })
      backend.create(['en'], '@evil.example/x', 'key', 'value', () => {
        expect(urls).to.eql([])
        done()
      })
    })

    it('still loads a scoped namespace from the path', (done) => {
      const urls = []
      const backend = new Backend(null, { loadPath: 'https://cdn.example.com/{{lng}}/{{ns}}.json', request: requestInto(urls) })
      backend.read('en', '@org/pkg', (err) => {
        expect(err).to.be(null)
        expect(urls).to.eql(['https://cdn.example.com/en/@org/pkg.json'])
        done()
      })
    })
  })

  describe('sanitizeLogValue', () => {
    it('strips CR, LF, NUL and other control chars', () => {
      expect(sanitizeLogValue('en\r\n2026-04-18 admin login'))
        .to.equal('en  2026-04-18 admin login')
      expect(sanitizeLogValue('en\u0000')).to.equal('en ')
    })
    it('passes non-strings through unchanged', () => {
      expect(sanitizeLogValue(undefined)).to.equal(undefined)
      expect(sanitizeLogValue(42)).to.equal(42)
    })
  })

  describe('redactUrlCredentials', () => {
    it('strips user:password from URLs', () => {
      expect(redactUrlCredentials('https://user:pass@example.com/locales/en.json'))
        .to.equal('https://example.com/locales/en.json')
      expect(redactUrlCredentials('https://example.com/locales/en.json'))
        .to.equal('https://example.com/locales/en.json')
    })
    it('handles malformed URLs (regex fallback)', () => {
      const out = redactUrlCredentials('//user:pass@example.com/path')
      expect(out.indexOf('user:pass@')).to.equal(-1)
    })
    it('passes non-strings / empty through', () => {
      expect(redactUrlCredentials(null)).to.equal(null)
      expect(redactUrlCredentials('')).to.equal('')
    })
  })
})
