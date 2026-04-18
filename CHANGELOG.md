### 3.0.5

Security release — all issues found via an internal audit. GHSA advisory filed after release.

- security: refuse to build request URLs when `lng` or `ns` values contain path-traversal, URL-structure (`?`, `#`, `%`, `@`, whitespace), path separators, control characters, prototype keys, or exceed 128 chars. Prevents path traversal / SSRF / URL injection via attacker-controlled language-code values. `isSafeUrlSegment` is permissive for legitimate i18next language codes (any BCP-47-like shape, underscores, hyphens, dots, `+`-joined multi-language requests) (GHSA-TBD)
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

