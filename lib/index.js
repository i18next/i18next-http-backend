import { defaults } from './utils.js'
import request from './request.js'

const getDefaults = () => {
  return {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/add/{{lng}}/{{ns}}',
    allowMultiLoading: false,
    parse: data => JSON.parse(data),
    stringify: JSON.stringify,
    parsePayload: (namespace, key, fallbackValue) => ({ [key]: fallbackValue || '' }),
    request,
    reloadInterval: false,
    customHeaders: {},
    queryStringParams: {},
    crossDomain: false, // used for XmlHttpRequest
    withCredentials: false, // used for XmlHttpRequest
    overrideMimeType: false, // used for XmlHttpRequest
    requestOptions: { // used for fetch
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'default'
    }
  }
}

class Backend {
  constructor (services, options = {}, allOptions = {}) {
    this.services = services
    this.options = options
    this.allOptions = allOptions
    this.type = 'backend'
    this.init(services, options, allOptions)
  }

  init (services, options = {}, allOptions = {}) {
    this.services = services
    this.options = defaults(options, this.options || {}, getDefaults())
    this.allOptions = allOptions
    if (this.options.reloadInterval) {
      setInterval(() => this.reload(), this.options.reloadInterval)
    }
  }

  readMulti (languages, namespaces, callback) {
    var loadPath = this.options.loadPath
    if (typeof this.options.loadPath === 'function') {
      loadPath = this.options.loadPath(languages, namespaces)
    }
    const url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') })
    this.loadUrl(url, callback, languages, namespaces)
  }

  read (language, namespace, callback) {
    var loadPath = this.options.loadPath
    if (typeof this.options.loadPath === 'function') {
      loadPath = this.options.loadPath([language], [namespace])
    }
    const url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace })
    this.loadUrl(url, callback, language, namespace)
  }

  loadUrl (url, callback, languages, namespaces) {
    this.options.request(this.options, url, undefined, (err, res) => {
      if (res && res.status >= 500 && res.status < 600) return callback('failed loading ' + url, true /* retry */)
      if (res && res.status >= 400 && res.status < 500) return callback('failed loading ' + url, false /* no retry */)
      if (err) return callback(err, false)

      let ret, parseErr
      try {
        ret = this.options.parse(res.data, languages, namespaces)
      } catch (e) {
        parseErr = 'failed parsing ' + url + ' to json'
      }
      if (parseErr) return callback(parseErr, false)
      callback(null, ret)
    })
  }

  create (languages, namespace, key, fallbackValue) {
    // If there is a falsey addPath, then abort -- this has been disabled.
    if (!this.options.addPath) return
    if (typeof languages === 'string') languages = [languages]
    const payload = this.options.parsePayload(namespace, key, fallbackValue)
    languages.forEach(lng => {
      const url = this.services.interpolator.interpolate(this.options.addPath, { lng: lng, ns: namespace })
      this.options.request(this.options, url, payload, (data, res) => {
        // TODO: if res.status === 4xx do log
      })
    })
  }

  reload () {
    const { backendConnector, languageUtils, logger } = this.services
    const currentLanguage = backendConnector.language
    if (currentLanguage && currentLanguage.toLowerCase() === 'cimode') return // avoid loading resources for cimode

    const toLoad = []
    const append = (lng) => {
      const lngs = languageUtils.toResolveHierarchy(lng)
      lngs.forEach(l => {
        if (toLoad.indexOf(l) < 0) toLoad.push(l)
      })
    }

    append(currentLanguage)

    if (this.allOptions.preload) this.allOptions.preload.forEach((l) => append(l))

    toLoad.forEach(lng => {
      this.allOptions.ns.forEach(ns => {
        backendConnector.read(lng, ns, 'read', null, null, (err, data) => {
          if (err) logger.warn(`loading namespace ${ns} for language ${lng} failed`, err)
          if (!err && data) logger.log(`loaded namespace ${ns} for language ${lng}`, data)

          backendConnector.loaded(`${lng}|${ns}`, err, data)
        })
      })
    })
  }
}

Backend.type = 'backend'

export default Backend
