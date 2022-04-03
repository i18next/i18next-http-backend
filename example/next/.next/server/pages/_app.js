"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./next-i18next.config.js":
/*!********************************!*\
  !*** ./next-i18next.config.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst HttpBackend = __webpack_require__(/*! i18next-http-backend/cjs */ \"i18next-http-backend/cjs\");\nconst ChainedBackend = (__webpack_require__(/*! i18next-chained-backend */ \"i18next-chained-backend\")[\"default\"]);\nconst LocalStorageBackend = (__webpack_require__(/*! i18next-localstorage-backend */ \"i18next-localstorage-backend\")[\"default\"]);\nmodule.exports = {\n    backend: {\n        backendOptions: [\n            {\n                expirationTime: 60 * 60 * 1000\n            },\n            {}\n        ],\n        backends:  false ? 0 : []\n    },\n    // debug: true,\n    i18n: {\n        defaultLocale: \"en\",\n        locales: [\n            \"en\",\n            \"de\"\n        ]\n    },\n    serializeConfig: false,\n    use:  false ? 0 : []\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9uZXh0LWkxOG5leHQuY29uZmlnLmpzLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBTUEsV0FBVyxHQUFHQyxtQkFBTyxDQUFDLDBEQUEwQixDQUFDO0FBQ3ZELE1BQU1DLGNBQWMsR0FBRUQsMEZBQTBDO0FBQ2hFLE1BQU1HLG1CQUFtQixHQUFHSCxvR0FBK0M7QUFFM0VJLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHO0lBQ2ZDLE9BQU8sRUFBRTtRQUNQQyxjQUFjLEVBQUU7WUFBQztnQkFBRUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSTthQUFFO1lBQUUsRUFBRTtTQUFDO1FBQ3hEQyxRQUFRLEVBQUUsTUFBNkIsR0FBRyxDQUFrQyxHQUFFLEVBQUU7S0FDakY7SUFDRCxlQUFlO0lBQ2ZDLElBQUksRUFBRTtRQUNKQyxhQUFhLEVBQUUsSUFBSTtRQUNuQkMsT0FBTyxFQUFFO1lBQUMsSUFBSTtZQUFFLElBQUk7U0FBQztLQUN0QjtJQUNEQyxlQUFlLEVBQUUsS0FBSztJQUN0QkMsR0FBRyxFQUFFLE1BQTZCLEdBQUcsQ0FBZ0IsR0FBRyxFQUFFO0NBQzNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdjEwLy4vbmV4dC1pMThuZXh0LmNvbmZpZy5qcz8xY2I5Il0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEh0dHBCYWNrZW5kID0gcmVxdWlyZSgnaTE4bmV4dC1odHRwLWJhY2tlbmQvY2pzJylcbmNvbnN0IENoYWluZWRCYWNrZW5kPSByZXF1aXJlKCdpMThuZXh0LWNoYWluZWQtYmFja2VuZCcpLmRlZmF1bHRcbmNvbnN0IExvY2FsU3RvcmFnZUJhY2tlbmQgPSByZXF1aXJlKCdpMThuZXh0LWxvY2Fsc3RvcmFnZS1iYWNrZW5kJykuZGVmYXVsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmFja2VuZDoge1xuICAgIGJhY2tlbmRPcHRpb25zOiBbeyBleHBpcmF0aW9uVGltZTogNjAgKiA2MCAqIDEwMDAgfSwge31dLCAvLyAxIGhvdXJcbiAgICBiYWNrZW5kczogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyBbTG9jYWxTdG9yYWdlQmFja2VuZCwgSHR0cEJhY2tlbmRdOiBbXSxcbiAgfSxcbiAgLy8gZGVidWc6IHRydWUsXG4gIGkxOG46IHtcbiAgICBkZWZhdWx0TG9jYWxlOiAnZW4nLFxuICAgIGxvY2FsZXM6IFsnZW4nLCAnZGUnXSxcbiAgfSxcbiAgc2VyaWFsaXplQ29uZmlnOiBmYWxzZSxcbiAgdXNlOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IFtDaGFpbmVkQmFja2VuZF0gOiBbXSxcbn1cbiJdLCJuYW1lcyI6WyJIdHRwQmFja2VuZCIsInJlcXVpcmUiLCJDaGFpbmVkQmFja2VuZCIsImRlZmF1bHQiLCJMb2NhbFN0b3JhZ2VCYWNrZW5kIiwibW9kdWxlIiwiZXhwb3J0cyIsImJhY2tlbmQiLCJiYWNrZW5kT3B0aW9ucyIsImV4cGlyYXRpb25UaW1lIiwiYmFja2VuZHMiLCJpMThuIiwiZGVmYXVsdExvY2FsZSIsImxvY2FsZXMiLCJzZXJpYWxpemVDb25maWciLCJ1c2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./next-i18next.config.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-i18next */ \"next-i18next\");\n/* harmony import */ var next_i18next__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_i18next__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _next_i18next_config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../next-i18next.config */ \"./next-i18next.config.js\");\n/* harmony import */ var _next_i18next_config__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_next_i18next_config__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst MyApp = ({ Component , pageProps  })=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n        ...pageProps\n    }, void 0, false, {\n        fileName: \"/Users/adrai/Projects/i18next/i18next-http-backend/example/next/pages/_app.js\",\n        lineNumber: 4,\n        columnNumber: 45\n    }, undefined)\n;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_i18next__WEBPACK_IMPORTED_MODULE_1__.appWithTranslation)(MyApp, (_next_i18next_config__WEBPACK_IMPORTED_MODULE_2___default())));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUFpRDtBQUNFO0FBRW5ELE1BQU1FLEtBQUssR0FBRyxDQUFDLEVBQUVDLFNBQVMsR0FBRUMsU0FBUyxHQUFFLGlCQUFLLDhEQUFDRCxTQUFTO1FBQUUsR0FBR0MsU0FBUzs7Ozs7aUJBQUk7QUFBQTtBQUV4RSxpRUFBZUosZ0VBQWtCLENBQUNFLEtBQUssRUFBRUQsNkRBQWMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3YxMC8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhcHBXaXRoVHJhbnNsYXRpb24gfSBmcm9tICduZXh0LWkxOG5leHQnXG5pbXBvcnQgbmV4dEkxOG5Db25maWcgZnJvbSAnLi4vbmV4dC1pMThuZXh0LmNvbmZpZydcblxuY29uc3QgTXlBcHAgPSAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSA9PiA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG5cbmV4cG9ydCBkZWZhdWx0IGFwcFdpdGhUcmFuc2xhdGlvbihNeUFwcCwgbmV4dEkxOG5Db25maWcpXG4iXSwibmFtZXMiOlsiYXBwV2l0aFRyYW5zbGF0aW9uIiwibmV4dEkxOG5Db25maWciLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "i18next-chained-backend":
/*!******************************************!*\
  !*** external "i18next-chained-backend" ***!
  \******************************************/
/***/ ((module) => {

module.exports = require("i18next-chained-backend");

/***/ }),

/***/ "i18next-http-backend/cjs":
/*!*******************************************!*\
  !*** external "i18next-http-backend/cjs" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("i18next-http-backend/cjs");

/***/ }),

/***/ "i18next-localstorage-backend":
/*!***********************************************!*\
  !*** external "i18next-localstorage-backend" ***!
  \***********************************************/
/***/ ((module) => {

module.exports = require("i18next-localstorage-backend");

/***/ }),

/***/ "next-i18next":
/*!*******************************!*\
  !*** external "next-i18next" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("next-i18next");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();