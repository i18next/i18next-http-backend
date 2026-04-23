import expect from 'expect.js'
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
      expect(isSafeLangUrlSegment('__proto__')).to.be(false)
      expect(isSafeLangUrlSegment('en\r\nX-Injected: bad')).to.be(false)
      expect(isSafeLangUrlSegment('')).to.be(false)
      expect(isSafeLangUrlSegment('a'.repeat(200))).to.be(false)
    })

    it('is still exported as `isSafeUrlSegment` for 3.0.5 backwards compat', () => {
      expect(isSafeUrlSegment).to.be(isSafeLangUrlSegment)
    })
  })

  describe('isSafeNsUrlSegment (loose — for `ns`, allows `/`)', () => {
    it('accepts nested namespace names with forward slashes', () => {
      expect(isSafeNsUrlSegment('a/b')).to.be(true)
      expect(isSafeNsUrlSegment('foo/bar/baz')).to.be(true)
      expect(isSafeNsUrlSegment('common')).to.be(true)
    })

    it('still rejects every concrete attack pattern from the 3.0.5 advisory', () => {
      expect(isSafeNsUrlSegment('..')).to.be(false)
      expect(isSafeNsUrlSegment('../etc/passwd')).to.be(false)
      expect(isSafeNsUrlSegment('a/../b')).to.be(false)
      expect(isSafeNsUrlSegment('foo\\bar')).to.be(false)
      expect(isSafeNsUrlSegment('ns?admin=true')).to.be(false)
      expect(isSafeNsUrlSegment('ns#frag')).to.be(false)
      expect(isSafeNsUrlSegment('ns%2F..')).to.be(false)
      expect(isSafeNsUrlSegment('ns@evil')).to.be(false)
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
