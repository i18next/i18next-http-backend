const arr = []
const each = arr.forEach
const slice = arr.slice

const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype']

export function defaults (obj) {
  each.call(slice.call(arguments, 1), (source) => {
    if (source) {
      for (const prop of Object.keys(source)) {
        if (UNSAFE_KEYS.indexOf(prop) > -1) continue
        if (obj[prop] === undefined) obj[prop] = source[prop]
      }
    }
  })
  return obj
}

// Returns true if `v` can be safely interpolated into a URL path segment.
// Denylist approach — i18next permits arbitrary language-code shapes
// (https://www.i18next.com/how-to/faq#how-should-the-language-codes-be-formatted)
// so we only block the concrete attack patterns: path traversal, path
// separators, URL structure characters, control characters, prototype keys,
// and oversized inputs. `+` is allowed — callers use `languages.join('+')`
// to request multiple languages in one request.
export function isSafeUrlSegment (v) {
  if (typeof v !== 'string') return false
  if (v.length === 0 || v.length > 128) return false
  if (UNSAFE_KEYS.indexOf(v) > -1) return false
  if (v.indexOf('..') > -1) return false
  if (v.indexOf('/') > -1 || v.indexOf('\\') > -1) return false
  // Block characters that would terminate/restructure the URL:
  // `?` (starts query), `#` (starts fragment), `%` (percent-encoded bypass
  // of `..`/`/` via `%2E%2E`/`%2F`), space (ambiguous), `@` (authority
  // boundary in userinfo-containing URLs).
  if (/[?#%\s@]/.test(v)) return false
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(v)) return false
  return true
}

// Strip control characters (CR/LF/NUL/C0/C1) from a string so it cannot
// inject fake log lines when concatenated into an error message (CWE-117).
export function sanitizeLogValue (v) {
  if (typeof v !== 'string') return v
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\r\n\x00-\x1F\x7F]/g, ' ')
}

// Redact user:password credentials from a URL-like string before logging.
// Handles both full URLs and malformed ones — on parse failure, falls back
// to a regex that matches the userinfo portion of the authority.
export function redactUrlCredentials (u) {
  if (typeof u !== 'string' || u.length === 0) return u
  try {
    const parsed = new URL(u)
    if (parsed.username || parsed.password) {
      parsed.username = ''
      parsed.password = ''
      return parsed.toString()
    }
    return u
  } catch (e) {
    return u.replace(/(\/\/)[^/@\s]+@/g, '$1')
  }
}

export function hasXMLHttpRequest () {
  return (typeof XMLHttpRequest === 'function' || typeof XMLHttpRequest === 'object')
}

/**
 * Determine whether the given `maybePromise` is a Promise.
 *
 * @param {*} maybePromise
 *
 * @returns {Boolean}
 */
function isPromise (maybePromise) {
  return !!maybePromise && typeof maybePromise.then === 'function'
}

/**
 * Convert any value to a Promise than will resolve to this value.
 *
 * @param {*} maybePromise
 *
 * @returns {Promise}
 */
export function makePromise (maybePromise) {
  if (isPromise(maybePromise)) {
    return maybePromise
  }

  return Promise.resolve(maybePromise)
}

const interpolationRegexp = /\{\{(.+?)\}\}/g
export function interpolate (str, data) {
  return str.replace(interpolationRegexp, (match, key) => {
    const k = key.trim()
    if (UNSAFE_KEYS.indexOf(k) > -1) return match
    const value = data[k]
    return value != null ? value : match
  })
}

// URL-specific variant: reject values that fail the URL-segment safety
// check. Returns `null` if any substitution is unsafe — callers should bail
// out cleanly rather than issue the request. For multi-value joins
// (`en+de`), validates each `+`-separated segment independently.
export function interpolateUrl (str, data) {
  let unsafe = false
  const result = str.replace(interpolationRegexp, (match, key) => {
    const k = key.trim()
    if (UNSAFE_KEYS.indexOf(k) > -1) return match
    const value = data[k]
    if (value == null) return match
    const segments = String(value).split('+')
    for (const seg of segments) {
      if (!isSafeUrlSegment(seg)) {
        unsafe = true
        return match
      }
    }
    return segments.join('+')
  })
  return unsafe ? null : result
}
