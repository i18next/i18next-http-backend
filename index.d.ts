import { BackendModule, ReadCallback } from "i18next";
import "i18next";

/// <reference lib="dom" />

type LoadPathCallback = (lngs: string[], namespaces: string[]) => string;

interface BackendOptions {
  /**
   * path where resources get loaded from, or a function
   * returning a path:
   * function(lngs, namespaces) { return customPath; }
   * the returned path will interpolate lng, ns if provided like giving a static path
   */
  loadPath?: string | LoadPathCallback;

  /**
   * path to post missing resources, will interpolate lng and ns values
   */
  addPath?: string;

  /**
   * your backend server supports multiLoading
   * locales/resources.json?lng=de+en&ns=ns1+ns2
   * set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading
   */
  allowMultiLoading?: boolean;

  /**
   * parse data after it has been fetched
   * in example use https://www.npmjs.com/package/json5
   * here it removes the letter a from the json (bad idea)
   */
  parse?(
    data: string,
    languages?: string | string[],
    namespaces?: string | string[]
  ): string;

  /**
   * How to stringify the body if present, when making requests to the server
   */
  stringify?(data: RequestPayload): string;

  /**
   * parse data before it has been sent by addPath
   */
  parsePayload?(
    namespace: string,
    key: string,
    fallbackValue?: string
  ): RequestPayload;

  /**
   * define a custom xhr function
   * can be used to support XDomainRequest in IE 8 and 9
   */
  request?(
    options: BackendOptions,
    url: string,
    payload: RequestPayload | undefined,
    callback: RequestCallback
  ): void;

  /**
   * periodically reload the localisation files:
   */
  reloadInterval: false | number;

  /**
   * set custom request headers
   * overrides headers previously set if the key is a duplicate of a header set internally:
   */
  customHeaders?: { [key: string]: string };

  /**
   * adds parameters to resource URL. 'example.com' -> 'example.com?v=1.3.5'
   */
  queryStringParams?: { [key: string]: string };

  /**
   * allow cross domain requests, only used for non-fetch APIs. See requestOptions when using fetch().
   */
  crossDomain?: boolean;

  /**
   * allow credentials on cross domain requests, only used for non-fetch APIs. See requestOptions when using fetch().
   */
  withCredentials?: boolean;

  /**
   * forces mime-type to be 'application/json', only used for non-fetch APIs
   */
  overrideMimeType?: boolean;

  /**
   * Set custom request options when using fetch() for loading localisation files.
   */
  requestOptions?: RequestInit | ((payload: RequestPayload) => RequestInit);
}

type RequestPayload = { [key: string]: any };
type RequestCallback = (error: any, response: RequestResponse) => void;

interface RequestResponse {
  status: number;
  // optional, only present if the request was successful:
  data?: string;
}

export default class I18NextHttpBackend
  implements BackendModule<BackendOptions> {
  constructor(services?: any, options?: BackendOptions);
  init(services?: any, options?: BackendOptions): void;
  readMulti(
    languages: string[],
    namespaces: string[],
    callback: ReadCallback
  ): void;
  read(language: string, namespace: string, callback: ReadCallback): void;
  loadUrl(
    url: string,
    callback: ReadCallback,
    languages?: string | string[],
    namespaces?: string | string[]
  ): void;
  create(
    languages: string | string[],
    namespace: string,
    key: string,
    fallbackValue: string
  ): void;
  type: "backend";
  services: any;
  options: BackendOptions;
}

declare module "i18next" {
  interface InitOptions {
    /**
     * Options for backend
     * @default undefined
     */
    backend?: BackendOptions;
  }
}
