const addQueryString = (url, params) => {
  if (params && typeof params === 'object') {
    let queryString = ''
    // Must encode data
    for (const paramName in params) {
      queryString += '&' + encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName])
    }
    if (!queryString) return url
    url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1)
  }
  return url
}

const fetchIt = (url, fetchOptions, callback, altFetch) => {
  const resolver = (response) => {
    if (!response.ok) return callback(response.statusText || 'Error', { status: response.status })
    response.text().then((data) => {
      callback(null, { status: response.status, data })
    }).catch(callback)
  }
  if (altFetch) {
    // already checked to have the proper signature
    const altResponse = altFetch(url, fetchOptions)
    if (altResponse instanceof Promise) {
      altResponse.then(resolver).catch(callback)
      return
    }
    // fall through
  }

  fetch(url, fetchOptions).then(resolver).catch(callback)
}

let omitFetchOptions = false

// fetch api stuff
const requestWithFetch = (options, url, payload, callback) => {
  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams)
  }
  const headers = {
    ...(typeof options.customHeaders === 'function' ? options.customHeaders() : options.customHeaders)
  }
  if (typeof window === 'undefined' && typeof global !== 'undefined' && typeof global.process !== 'undefined' && global.process.versions && global.process.versions.node) {
    headers['User-Agent'] = `i18next-http-backend (node/${global.process.version}; ${global.process.platform} ${global.process.arch})`
  }
  if (payload) headers['Content-Type'] = 'application/json'
  const reqOptions = typeof options.requestOptions === 'function' ? options.requestOptions(payload) : options.requestOptions
  const fetchOptions = {
    method: payload ? 'POST' : 'GET',
    body: payload ? options.stringify(payload) : undefined,
    headers,
    ...(omitFetchOptions ? {} : reqOptions)
  }
  const altFetch = typeof options.alternateFetch === 'function' && options.alternateFetch.length >= 1 ? options.alternateFetch : undefined
  try {
    fetchIt(url, fetchOptions, callback, altFetch)
  } catch (e) {
    if (!reqOptions || Object.keys(reqOptions).length === 0 || !e.message || e.message.indexOf('not implemented') < 0) {
      return callback(e)
    }
    try {
      Object.keys(reqOptions).forEach((opt) => {
        delete fetchOptions[opt]
      })
      fetchIt(url, fetchOptions, callback, altFetch)
      omitFetchOptions = true
    } catch (err) {
      callback(err)
    }
  }
}

const request = (options, url, payload, callback) => {
  if (typeof payload === 'function') {
    callback = payload
    payload = undefined
  }
  callback = callback || (() => {})

  if (typeof fetch === 'undefined') { callback(new Error('No fetch implementation found!')) }

  return requestWithFetch(options, url, payload, callback)
}

export default request
