import expect from 'expect.js'
import {
  interpolate,
  interpolateUrl,
  isSafeUrlSegment,
  sanitizeLogValue,
  redactUrlCredentials
} from '../lib/utils.js'

// Security tests for fixes shipped in 3.0.5.
// See CHANGELOG for associated GHSA advisory.

describe('security', () => {
  describe('isSafeUrlSegment', () => {
    it('accepts arbitrary language-code shapes (i18next permits any shape)', () => {
      expect(isSafeUrlSegment('en')).to.be(true)
      expect(isSafeUrlSegment('de-DE')).to.be(true)
      expect(isSafeUrlSegment('en_US')).to.be(true)
      expect(isSafeUrlSegment('zh-Hant-HK')).to.be(true)
      expect(isSafeUrlSegment('pirate-speak')).to.be(true)
      expect(isSafeUrlSegment('my-custom.ns')).to.be(true)
    })

    it('rejects path-traversal / URL-structure / control-char payloads', () => {
      expect(isSafeUrlSegment('../etc/passwd')).to.be(false)
      expect(isSafeUrlSegment('..')).to.be(false)
      expect(isSafeUrlSegment('foo/bar')).to.be(false)
      expect(isSafeUrlSegment('foo\\bar')).to.be(false)
      expect(isSafeUrlSegment('en?admin=true')).to.be(false)
      expect(isSafeUrlSegment('en#frag')).to.be(false)
      expect(isSafeUrlSegment('en%2F..')).to.be(false)
      expect(isSafeUrlSegment('en user')).to.be(false)
      expect(isSafeUrlSegment('en@evil.com')).to.be(false)
      expect(isSafeUrlSegment('__proto__')).to.be(false)
      expect(isSafeUrlSegment('en\r\nX-Injected: bad')).to.be(false)
      expect(isSafeUrlSegment('')).to.be(false)
      expect(isSafeUrlSegment('a'.repeat(200))).to.be(false)
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

    it('returns null when any segment of a multi-lang + join is unsafe', () => {
      expect(interpolateUrl('/locales/{{lng}}.json', { lng: 'en+../etc/passwd' }))
        .to.equal(null)
    })

    it('ignores __proto__ placeholder', () => {
      expect(interpolateUrl('/{{__proto__}}/x', { __proto__: { a: 1 } }))
        .to.equal('/{{__proto__}}/x')
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
