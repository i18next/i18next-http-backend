# Introduction

[![Actions](https://github.com/i18next/i18next-http-backend/workflows/node/badge.svg)](https://github.com/i18next/i18next-http-backend/actions?query=workflow%3Anode)
[![Actions deno](https://github.com/i18next/i18next-http-backend/workflows/deno/badge.svg)](https://github.com/i18next/i18next-http-backend/actions?query=workflow%3Adeno)
[![Travis](https://img.shields.io/travis/i18next/i18next-http-backend/master.svg?style=flat-square)](https://travis-ci.org/i18next/i18next-http-backend)
[![npm version](https://img.shields.io/npm/v/i18next-http-backend.svg?style=flat-square)](https://www.npmjs.com/package/i18next-http-backend)

This is a simple i18next backend to be used in Node.js, in the browser and for Deno. It will load resources from a backend server using the XMLHttpRequest or the fetch API.

It's based on the deprecated [i18next-xhr-backend](https://github.com/i18next/i18next-xhr-backend) and can mostly be used as a drop-in replacement.

*[Why i18next-xhr-backend was deprecated?](https://github.com/i18next/i18next-xhr-backend/issues/348#issuecomment-663060275)*

## Advice:

If you don't want to manage your translation files manually or are simply looking for a better management solution, take a look at [i18next-locize-backend](https://github.com/locize/i18next-locize-backend).

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/i18next-http-backend) or [downloaded](https://github.com/i18next/i18next-http-backend/blob/master/i18nextHttpBackend.min.js) from this repo.

There's also the possibility to directly import it via a CDN like [jsdelivr](https://cdn.jsdelivr.net/npm/i18next-http-backend@1.3.1/i18nextHttpBackend.min.js) or [unpkg](https://unpkg.com/i18next-http-backend@1.3.1/i18nextHttpBackend.min.js) or similar.

```bash
# npm package
$ npm install i18next-http-backend
```

Wiring up:

```js
import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';

i18next.use(HttpApi).init(i18nextOptions);
```

for Deno:

```js
import i18next from 'https://deno.land/x/i18next/index.js'
import Backend from 'https://deno.land/x/i18next_http_backend/index.js'

i18next.use(Backend).init(i18nextOptions);
```

for plain browser:

```html
<script src="https://cdn.jsdelivr.net/npm/i18next-http-backend@1.3.1/i18nextHttpBackend.min.js"></script>
<!-- an example can be found in example/jquery/index.html -->
```

- As with all modules you can either pass the constructor function (class) to the i18next.use or a concrete instance.
- If you don't use a module loader it will be added to `window.i18nextHttpBackend`

## Backend Options

```js
{
  // path where resources get loaded from, or a function
  // returning a path:
  // function(lngs, namespaces) { return customPath; }
  // the returned path will interpolate lng, ns if provided like giving a static path
  // the function might return a promise
  //
  // If allowMultiLoading is false, lngs and namespaces will have only one element each,
  // If allowMultiLoading is true, lngs and namespaces can have multiple elements
  loadPath: '/locales/{{lng}}/{{ns}}.json',

  // path to post missing resources, or a function
  // function(lng, namespace) { return customPath; }
  // the returned path will interpolate lng, ns if provided like giving a static path
  addPath: '/locales/add/{{lng}}/{{ns}}',

  // your backend server supports multiloading
  // /locales/resources.json?lng=de+en&ns=ns1+ns2
  // Adapter is needed to enable MultiLoading https://github.com/i18next/i18next-multiload-backend-adapter
  // Returned JSON structure in this case is
  // {
  //  lang : {
  //   namespaceA: {},
  //   namespaceB: {},
  //   ...etc
  //  }
  // }
  allowMultiLoading: false, // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading

  // parse data after it has been fetched
  // in example use https://www.npmjs.com/package/json5
  // here it removes the letter a from the json (bad idea)
  parse: function(data) { return data.replace(/a/g, ''); },

  //parse data before it has been sent by addPath
  parsePayload: function(namespace, key, fallbackValue) { return { key } },

  // allow cross domain requests
  crossDomain: false,

  // allow credentials on cross domain requests
  withCredentials: false,

  // overrideMimeType sets request.overrideMimeType("application/json")
  overrideMimeType: false,

  // custom request headers sets request.setRequestHeader(key, value)
  customHeaders: {
    authorization: 'foo',
    // ...
  },
  // can also be a function, that returns the headers
  customHeaders: () => ({
    authorization: 'foo',
    // ...
  }),

  requestOptions: { // used for fetch, can also be a function (payload) => ({ method: 'GET' })
    mode: 'cors',
    credentials: 'same-origin',
    cache: 'default'
  }

  // define a custom request function
  // can be used to support XDomainRequest in IE 8 and 9
  //
  // 'options' will be this entire options object
  // 'url' will be passed the value of 'loadPath'
  // 'payload' will be a key:value object used when saving missing translations
  // 'callback' is a function that takes two parameters, 'err' and 'res'.
  //            'err' should be an error
  //            'res' should be an object with a 'status' property and a 'data' property containing a stringified object instance beeing the key:value translation pairs for the
  //            requested language and namespace, or null in case of an error.
  request: function (options, url, payload, callback) {},

  // adds parameters to resource URL. 'example.com' -> 'example.com?v=1.3.5'
  queryStringParams: { v: '1.3.5' },

  reloadInterval: false // can be used to reload resources in a specific interval (useful in server environments)
}
```

Options can be passed in:

**preferred** - by setting options.backend in i18next.init:

```js
import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';

i18next.use(HttpApi).init({
  backend: options,
});
```

on construction:

```js
import HttpApi from 'i18next-http-backend';
const HttpApi = new HttpApi(null, options);
```

via calling init:

```js
import HttpApi from 'i18next-http-backend';
const HttpApi = new HttpApi();
HttpApi.init(null, options);
```

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**From the creators of i18next: localization as a service - locize.com**

A translation management system built around the i18next ecosystem - [locize.com](https://locize.com).

![locize](https://locize.com/img/ads/github_locize.png)

With using [locize](http://locize.com/?utm_source=react_i18next_readme&utm_medium=github) you directly support the future of i18next.

---
