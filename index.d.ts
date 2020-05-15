import { BackendModule, ReadCallback } from 'i18next';

type LoadPathOption = string | ((lngs: string[], namespaces: string[]) => string);

interface BackendOptions {
  /**
   * path where resources get loaded from, or a function
   * returning a path:
   * function(lngs, namespaces) { return customPath; }
   * the returned path will interpolate lng, ns if provided like giving a static path
   */
  loadPath?: LoadPathOption;
  /**
   * path to post missing resources
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
  parse?(data: string, languages?: string | string[], namespaces?: string | string[]): string;
  /**
   * parse data before it has been sent by addPath
   */
  parsePayload?(namespace: string, key: string, fallbackValue?: string): { [key: string]: any };
  /**
   * allow cross domain requests
   */
  crossDomain?: boolean;
  /**
   * allow credentials on cross domain requests
   */
  withCredentials?: boolean;
  /**
   * define a custom xhr function
   * can be used to support XDomainRequest in IE 8 and 9
   */
  request?(
    options: BackendOptions,
    url: string,
    payload: {} | string,
    callback: RequestCallback,
  ): void;
  /**
   * adds parameters to resource URL. 'example.com' -> 'example.com?v=1.3.5'
   */
  queryStringParams?: { [key: string]: string };

  customHeaders?: { [key: string]: string };
}

type RequestCallback = (error: any, response: RequestResponse) => void;

interface RequestResponse {
  status: number,
  data: string
}

export default class I18NextHttpBackend implements BackendModule<BackendOptions> {
  constructor(services?: any, options?: BackendOptions);
  init(services?: any, options?: BackendOptions): void;
  readMulti(languages: string[], namespaces: string[], callback: ReadCallback): void;
  read(language: string, namespace: string, callback: ReadCallback): void;
  loadUrl(url: string, callback: ReadCallback, languages?: string | string[], namespaces?: string | string[]): void;
  create(languages: string | string[], namespace: string, key: string, fallbackValue: string): void;
  type: 'backend';
  services: any;
  options: BackendOptions;
}
