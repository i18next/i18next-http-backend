var i18nextHttpBackend = (function() {
	//#region lib/utils.js
	const arr = [];
	arr.forEach;
	arr.slice;
	const UNSAFE_KEYS$1 = [
		"__proto__",
		"constructor",
		"prototype"
	];
	function isSafeUrlSegmentBase(v) {
		if (typeof v !== "string") return false;
		if (v.length === 0 || v.length > 128) return false;
		if (UNSAFE_KEYS$1.indexOf(v) > -1) return false;
		if (v.indexOf("..") > -1) return false;
		if (v.indexOf("\\") > -1) return false;
		if (/[?#%\s@]/.test(v)) return false;
		if (/[\x00-\x1F\x7F]/.test(v)) return false;
		return true;
	}
	function isSafeLangUrlSegment(v) {
		if (!isSafeUrlSegmentBase(v)) return false;
		if (v.indexOf("/") > -1) return false;
		return true;
	}
	function isSafeNsUrlSegment(v) {
		return isSafeUrlSegmentBase(v);
	}
	const SAFETY_CHECK_BY_KEY = {
		lng: isSafeLangUrlSegment,
		ns: isSafeNsUrlSegment
	};
	function sanitizeLogValue(v) {
		if (typeof v !== "string") return v;
		return v.replace(/[\r\n\x00-\x1F\x7F]/g, " ");
	}
	function redactUrlCredentials(u) {
		if (typeof u !== "string" || u.length === 0) return u;
		try {
			const parsed = new URL(u);
			if (parsed.username || parsed.password) {
				parsed.username = "";
				parsed.password = "";
				return parsed.toString();
			}
			return u;
		} catch (e) {
			return u.replace(/(\/\/)[^/@\s]+@/g, "$1");
		}
	}
	function hasXMLHttpRequest() {
		return typeof XMLHttpRequest === "function" || typeof XMLHttpRequest === "object";
	}
	/**
	* Determine whether the given `maybePromise` is a Promise.
	*
	* @param {*} maybePromise
	*
	* @returns {Boolean}
	*/
	function isPromise(maybePromise) {
		return !!maybePromise && typeof maybePromise.then === "function";
	}
	/**
	* Convert any value to a Promise than will resolve to this value.
	*
	* @param {*} maybePromise
	*
	* @returns {Promise}
	*/
	function makePromise(maybePromise) {
		if (isPromise(maybePromise)) return maybePromise;
		return Promise.resolve(maybePromise);
	}
	const interpolationRegexp = /\{\{(.+?)\}\}/g;
	function interpolateUrl(str, data) {
		let unsafe = false;
		const result = str.replace(interpolationRegexp, (match, key) => {
			const k = key.trim();
			if (UNSAFE_KEYS$1.indexOf(k) > -1) return match;
			const value = data[k];
			if (value == null) return match;
			const check = SAFETY_CHECK_BY_KEY[k] || isSafeLangUrlSegment;
			const segments = String(value).split("+");
			for (const seg of segments) if (!check(seg)) {
				unsafe = true;
				return match;
			}
			return segments.join("+");
		});
		return unsafe ? null : result;
	}
	//#endregion
	//#region lib/request.js
	const g = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : void 0;
	let fetchApi;
	if (typeof fetch === "function") fetchApi = fetch;
	else if (g && typeof g.fetch === "function") fetchApi = g.fetch;
	const XmlHttpRequestApi = hasXMLHttpRequest() && g ? g.XMLHttpRequest : void 0;
	const ActiveXObjectApi = typeof ActiveXObject === "function" && g ? g.ActiveXObject : void 0;
	const UNSAFE_KEYS = [
		"__proto__",
		"constructor",
		"prototype"
	];
	const addQueryString = (url, params) => {
		if (params && typeof params === "object") {
			let queryString = "";
			for (const paramName of Object.keys(params)) {
				if (UNSAFE_KEYS.indexOf(paramName) > -1) continue;
				queryString += "&" + encodeURIComponent(paramName) + "=" + encodeURIComponent(params[paramName]);
			}
			if (!queryString) return url;
			url = url + (url.indexOf("?") !== -1 ? "&" : "?") + queryString.slice(1);
		}
		return url;
	};
	const fetchIt = (url, fetchOptions, callback, altFetch) => {
		const resolver = (response) => {
			if (!response.ok) return callback(response.statusText || "Error", { status: response.status });
			response.text().then((data) => {
				callback(null, {
					status: response.status,
					data
				});
			}).catch(callback);
		};
		if (altFetch) {
			const altResponse = altFetch(url, fetchOptions);
			if (altResponse instanceof Promise) {
				altResponse.then(resolver).catch(callback);
				return;
			}
		}
		if (typeof fetch === "function") fetch(url, fetchOptions).then(resolver).catch(callback);
		else fetchApi(url, fetchOptions).then(resolver).catch(callback);
	};
	const requestWithFetch = (options, url, payload, callback) => {
		if (options.queryStringParams) url = addQueryString(url, options.queryStringParams);
		const headers = { ...typeof options.customHeaders === "function" ? options.customHeaders() : options.customHeaders };
		if (typeof window === "undefined" && typeof global !== "undefined" && typeof global.process !== "undefined" && global.process.versions && global.process.versions.node) headers["User-Agent"] = `i18next-http-backend (node/${global.process.version}; ${global.process.platform} ${global.process.arch})`;
		if (payload) headers["Content-Type"] = "application/json";
		const reqOptions = typeof options.requestOptions === "function" ? options.requestOptions(payload) : options.requestOptions;
		const fetchOptions = {
			method: payload ? "POST" : "GET",
			body: payload ? options.stringify(payload) : void 0,
			headers,
			...options._omitFetchOptions ? {} : reqOptions
		};
		const altFetch = typeof options.alternateFetch === "function" && options.alternateFetch.length >= 1 ? options.alternateFetch : void 0;
		try {
			fetchIt(url, fetchOptions, callback, altFetch);
		} catch (e) {
			if (!reqOptions || Object.keys(reqOptions).length === 0 || !e.message || e.message.indexOf("not implemented") < 0) return callback(e);
			try {
				Object.keys(reqOptions).forEach((opt) => {
					delete fetchOptions[opt];
				});
				fetchIt(url, fetchOptions, callback, altFetch);
				options._omitFetchOptions = true;
			} catch (err) {
				callback(err);
			}
		}
	};
	const requestWithXmlHttpRequest = (options, url, payload, callback) => {
		if (payload && typeof payload === "object") payload = addQueryString("", payload).slice(1);
		if (options.queryStringParams) url = addQueryString(url, options.queryStringParams);
		try {
			const x = XmlHttpRequestApi ? new XmlHttpRequestApi() : new ActiveXObjectApi("MSXML2.XMLHTTP.3.0");
			x.open(payload ? "POST" : "GET", url, 1);
			if (!options.crossDomain) x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			x.withCredentials = !!options.withCredentials;
			if (payload) x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			if (x.overrideMimeType) x.overrideMimeType("application/json");
			let h = options.customHeaders;
			h = typeof h === "function" ? h() : h;
			if (h) for (const i of Object.keys(h)) {
				if (UNSAFE_KEYS.indexOf(i) > -1) continue;
				x.setRequestHeader(i, h[i]);
			}
			x.onreadystatechange = () => {
				x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, {
					status: x.status,
					data: x.responseText
				});
			};
			x.send(payload);
		} catch (e) {
			console && console.log(e);
		}
	};
	const request = (options, url, payload, callback) => {
		if (typeof payload === "function") {
			callback = payload;
			payload = void 0;
		}
		callback = callback || (() => {});
		if (fetchApi && url.indexOf("file:") !== 0) return requestWithFetch(options, url, payload, callback);
		if (hasXMLHttpRequest() || typeof ActiveXObject === "function") return requestWithXmlHttpRequest(options, url, payload, callback);
		callback(/* @__PURE__ */ new Error("No fetch and no xhr implementation found!"));
	};
	//#endregion
	//#region lib/index.js
	const getDefaults = () => {
		return {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
			addPath: "/locales/add/{{lng}}/{{ns}}",
			parse: (data) => JSON.parse(data),
			stringify: JSON.stringify,
			parsePayload: (namespace, key, fallbackValue) => ({ [key]: fallbackValue || "" }),
			parseLoadPayload: (languages, namespaces) => void 0,
			request,
			reloadInterval: typeof window !== "undefined" ? false : 3600 * 1e3,
			customHeaders: {},
			queryStringParams: {},
			crossDomain: false,
			withCredentials: false,
			overrideMimeType: false,
			requestOptions: {
				mode: "cors",
				credentials: "same-origin",
				cache: "default"
			}
		};
	};
	var Backend = class {
		constructor(services, options = {}, allOptions = {}) {
			this.services = services;
			this.options = options;
			this.allOptions = allOptions;
			this.type = "backend";
			this.init(services, options, allOptions);
		}
		init(services, options = {}, allOptions = {}) {
			this.services = services;
			this.options = {
				...getDefaults(),
				...this.options || {},
				...options
			};
			this.allOptions = allOptions;
			if (this.services && this.options.reloadInterval) {
				const timer = setInterval(() => this.reload(), this.options.reloadInterval);
				if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
			}
		}
		readMulti(languages, namespaces, callback) {
			this._readAny(languages, languages, namespaces, namespaces, callback);
		}
		read(language, namespace, callback) {
			this._readAny([language], language, [namespace], namespace, callback);
		}
		_readAny(languages, loadUrlLanguages, namespaces, loadUrlNamespaces, callback) {
			let loadPath = this.options.loadPath;
			if (typeof this.options.loadPath === "function") loadPath = this.options.loadPath(languages, namespaces);
			loadPath = makePromise(loadPath);
			loadPath.then((resolvedLoadPath) => {
				if (!resolvedLoadPath) return callback(null, {});
				const url = interpolateUrl(resolvedLoadPath, {
					lng: languages.join("+"),
					ns: namespaces.join("+")
				});
				if (url == null) {
					const safeLngs = languages.map(sanitizeLogValue).join(", ");
					const safeNss = namespaces.map(sanitizeLogValue).join(", ");
					return callback(/* @__PURE__ */ new Error("i18next-http-backend: unsafe lng/ns value — refusing to build request URL for languages=[" + safeLngs + "] namespaces=[" + safeNss + "]"), false);
				}
				this.loadUrl(url, callback, loadUrlLanguages, loadUrlNamespaces);
			});
		}
		loadUrl(url, callback, languages, namespaces) {
			const lng = typeof languages === "string" ? [languages] : languages;
			const ns = typeof namespaces === "string" ? [namespaces] : namespaces;
			const payload = this.options.parseLoadPayload(lng, ns);
			const safeUrl = sanitizeLogValue(redactUrlCredentials(url));
			this.options.request(this.options, url, payload, (err, res) => {
				if (res && (res.status >= 500 && res.status < 600 || !res.status)) return callback("failed loading " + safeUrl + "; status code: " + res.status, true);
				if (res && res.status >= 400 && res.status < 500) return callback("failed loading " + safeUrl + "; status code: " + res.status, false);
				if (!res && err && err.message) {
					const errorMessage = err.message.toLowerCase();
					if ([
						"failed",
						"fetch",
						"network",
						"load"
					].find((term) => errorMessage.indexOf(term) > -1)) return callback("failed loading " + safeUrl + ": " + sanitizeLogValue(err.message), true);
				}
				if (err) return callback(err, false);
				let ret, parseErr;
				try {
					if (typeof res.data === "string") ret = this.options.parse(res.data, languages, namespaces);
					else ret = res.data;
				} catch (e) {
					parseErr = "failed parsing " + safeUrl + " to json";
				}
				if (parseErr) return callback(parseErr, false);
				callback(null, ret);
			});
		}
		create(languages, namespace, key, fallbackValue, callback) {
			if (!this.options.addPath) return;
			if (typeof languages === "string") languages = [languages];
			const payload = this.options.parsePayload(namespace, key, fallbackValue);
			let finished = 0;
			const dataArray = [];
			const resArray = [];
			languages.forEach((lng) => {
				let addPath = this.options.addPath;
				if (typeof this.options.addPath === "function") addPath = this.options.addPath(lng, namespace);
				const url = interpolateUrl(addPath, {
					lng,
					ns: namespace
				});
				if (url == null) {
					finished += 1;
					if (callback && finished === languages.length) callback(dataArray, resArray);
					return;
				}
				this.options.request(this.options, url, payload, (data, res) => {
					finished += 1;
					dataArray.push(data);
					resArray.push(res);
					if (finished === languages.length) {
						if (typeof callback === "function") callback(dataArray, resArray);
					}
				});
			});
		}
		reload() {
			const { backendConnector, languageUtils, logger } = this.services;
			const currentLanguage = backendConnector.language;
			if (currentLanguage && currentLanguage.toLowerCase() === "cimode") return;
			const toLoad = [];
			const append = (lng) => {
				languageUtils.toResolveHierarchy(lng).forEach((l) => {
					if (toLoad.indexOf(l) < 0) toLoad.push(l);
				});
			};
			append(currentLanguage);
			if (this.allOptions.preload) this.allOptions.preload.forEach((l) => append(l));
			toLoad.forEach((lng) => {
				this.allOptions.ns.forEach((ns) => {
					backendConnector.read(lng, ns, "read", null, null, (err, data) => {
						if (err) logger.warn(`loading namespace ${ns} for language ${lng} failed`, err);
						if (!err && data) logger.log(`loaded namespace ${ns} for language ${lng}`, data);
						backendConnector.loaded(`${lng}|${ns}`, err, data);
					});
				});
			});
		}
	};
	Backend.type = "backend";
	//#endregion
	return Backend;
})();
