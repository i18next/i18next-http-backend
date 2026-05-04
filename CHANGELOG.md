### 4.0.0

- BREAKING: drop `cross-fetch` dependency. `i18next-http-backend` now requires a host-provided `fetch`. This is available in Node ≥ 18 (stable since Node 21), all modern browsers, Deno, and Bun. For runtimes without native `fetch`, install a ponyfill yourself and inject it via `options.alternateFetch`, or stay on v3.x.
- BREAKING: minimum Node version is now 18 (`engines.node = ">=18"`).
- chore: simplified environment detection in `lib/request.js` — uses `globalThis` (with `global` / `window` fallbacks for legacy embedded runtimes) instead of separate `global.*` / `window.*` branches per API. XHR / ActiveXObject are still picked up if the host provides them, but no longer polyfilled.
- chore: declared `"sideEffects": false` for better tree-shaking by downstream bundlers.
- build: replaced babel + browserify + uglify-js with [`tsdown`](https://tsdown.dev) (rolldown + oxc). One config produces ESM, CJS, and the IIFE browser bundles. Drops `@babel/cli`, `@babel/core`, `@babel/preset-env`, `babel-plugin-add-module-exports`, `browserify`, `uglify-js`, the `fixcjs` rewrite hack, and the `--ignore cross-fetch` browserify flag. Side benefit: minified browser bundle shrinks from ~13 KB to ~6.8 KB (oxc minifier + no babel runtime helpers).
- build: ESM and CJS outputs are now bundled into a single `index.js` per format (previously one file per `lib/*.js` module). The package's `exports` map is unchanged, so this is invisible to consumers using documented entry points.
- lint: replaced `eslint-config-standard` (+ five plugins) with [`neostandard`](https://github.com/neostandard/neostandard) and migrated to ESLint 9 flat config (`eslint.config.mjs`). Removed deprecated `tslint` and `dtslint` — `test:typescript` now runs `tsc --noEmit` plus `tsd`.
- chore: tightened `.npmignore` — published tarball no longer includes the source `lib/`, the build configs (`tsdown.config.ts`, `eslint.config.mjs`, `tsconfig.json`), or the root `index.js` re-export shim. Drops from 21.3 KB → ~17 KB packed.
- docs: `alternateFetch` is now documented in the README options block as the supported escape hatch for fetch ponyfills, test mocking, and request interception. v4 migration note added to "Getting started".

### 3.0.6

- fix: allow forward slashes in `ns` values so nested namespace names (mapping to URL layouts such as `/locales/en/a/b.json`) fetch correctly again. 3.0.5's security fix applied the same strict URL-segment check to both `lng` and `ns`, which was correct for `lng` (no BCP-47 shape contains `/`) but over-strict for `ns` — nested namespaces containing `/` were never officially supported, but the behaviour fell out of the implicit string-substitution semantics of `loadPath` and is common enough in the wild to be worth accommodating. `isSafeUrlSegment` is now split into `isSafeLangUrlSegment` (strict — still rejects `/`) and `isSafeNsUrlSegment` (loose — allows `/` but still rejects `..`, `\`, URL-structure characters, control chars, prototype keys, and oversized inputs). `isSafeUrlSegment` is kept as a backwards-compatible alias for the strict check. The 3.0.5 security fix remains in force for every concrete attack pattern from the original advisory.

### 3.0.5

Security release — all issues found via an internal audit. See published advisory [GHSA-q89c-q3h5-w34g](https://github.com/i18next/i18next-http-backend/security/advisories/GHSA-q89c-q3h5-w34g).

- security: refuse to build request URLs when `lng` or `ns` values contain path-traversal, URL-structure (`?`, `#`, `%`, `@`, whitespace), path separators, control characters, prototype keys, or exceed 128 chars. Prevents path traversal / SSRF / URL injection via attacker-controlled language-code values. `isSafeUrlSegment` is permissive for legitimate i18next language codes (any BCP-47-like shape, underscores, hyphens, dots, `+`-joined multi-language requests) ([GHSA-q89c-q3h5-w34g](https://github.com/i18next/i18next-http-backend/security/advisories/GHSA-q89c-q3h5-w34g))
- security: per-instance `omitFetchOptions` — the fetch-options-stripping fallback is now scoped to a single backend instance via `options._omitFetchOptions` instead of a module-level boolean. One instance hitting a "not implemented" fetch error no longer permanently strips `requestOptions` (including `credentials`, `mode`, `cache`) from every other backend instance in the same process
- security: strip CR/LF/NUL and other C0/C1 control characters from `lng`/`ns` / URL values before they appear in error-callback strings (CWE-117 log forging)
- security: redact `user:password` credentials from URLs before including them in error-callback strings — prevents leaking basic-auth credentials embedded in `loadPath` / `addPath`
- security: iterate own enumerable keys only (`Object.keys` + prototype-key guard) in `addQueryString` and in the `customHeaders` loop in XHR mode — prevents prototype-pollution amplification into the URL and request headers
- chore: ignore `.env*` and `*.pem`/`*.key` files in `.gitignore`

### 3.0.4

- use own interpolation function for loadPath and addPath instead of relying on i18next's interpolator [i18next#2420](https://github.com/i18next/i18next/issues/2420) — this means only `{{lng}}` and `{{ns}}` placeholders are supported; custom interpolation prefix/suffix from i18next config no longer applies to backend paths

### 3.0.2

- optimize fetchApi selector

### 3.0.1

- try to get rid of top-level await

### 3.0.0

- fix for Deno 2 and removal of unnecessary .cjs file
- for esm build environments not supporting top-level await, you should import the `i18next-http-backend/cjs` export or stay at v2.6.2 or v2.7.1

### 2.7.3

- optimize fetchApi selector [backported]

### 2.7.1

- same as 2.6.2

### 2.7.0

- deprecated, same as v3.0.0

### 2.6.2

- improve network error detection across browsers [152](https://github.com/i18next/i18next-http-backend/pull/152)

### 2.6.1

- optimize "Failed to fetch" retry case [147](https://github.com/i18next/i18next-http-backend/issues/147)

### 2.6.0

- fix "Failed to fetch" retry case [147](https://github.com/i18next/i18next-http-backend/issues/147)

### 2.5.2

- dereference timers in node.js so that the process may exit when finished [139](https://github.com/i18next/i18next-http-backend/pull/139)

### 2.5.1

- fix: remove typeof window.document === 'undefined' check which deopt bundle optimization [137](https://github.com/i18next/i18next-http-backend/pull/137)

### 2.5.0

- added fetch interceptor to the Backend Options [133](https://github.com/i18next/i18next-http-backend/pull/133)

### 2.4.3

- fix: overriding options

### 2.4.2

- fix: mjs typings export

### 2.4.1

- fix: separate cjs and mjs typings

### 2.3.1

- fix for browser usage

### 2.3.0

- update deps

### 2.2.2

- hack for debug mode in react-native

### 2.2.1

- fix for types moduleResolution "node16"

### 2.2.0

- parseLoadPayload for POST request [110](https://github.com/i18next/i18next-http-backend/pull/110)

### 2.1.1

- regression fix for saveMissing signature [1890](https://github.com/i18next/i18next/issues/1890)

### 2.1.0

- typescript: export the backend options type [105](https://github.com/i18next/i18next-http-backend/pull/105)

### 2.0.2

- typescript: static type prop

### 2.0.1

- fix if url starts with file:// [100](https://github.com/i18next/i18next-http-backend/issues/100)

### 2.0.0

- typescript: update for major i18next version

