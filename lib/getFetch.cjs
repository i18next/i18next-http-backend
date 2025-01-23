/* eslint-disable no-var, no-undef */
var fetchApi = typeof fetch === 'function' ? fetch : undefined
if (typeof global !== 'undefined' && global.fetch) {
  fetchApi = global.fetch
} else if (typeof window !== 'undefined' && window.fetch) {
  fetchApi = window.fetch
}

if (typeof require !== 'undefined' && typeof window === 'undefined') {
  var f = fetchApi || require('cross-fetch')
  if (f.default) f = f.default
  exports.default = f
  module.exports = exports.default
}
