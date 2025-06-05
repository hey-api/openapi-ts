import Handlebars from 'handlebars';

// @ts-expect-error
import templateClient from '../legacy/handlebars/compiled/client.js';
// @ts-expect-error
import angularGetHeaders from '../legacy/handlebars/compiled/core/angular/getHeaders.js';
// @ts-expect-error
import angularGetRequestBody from '../legacy/handlebars/compiled/core/angular/getRequestBody.js';
// @ts-expect-error
import angularGetResponseBody from '../legacy/handlebars/compiled/core/angular/getResponseBody.js';
// @ts-expect-error
import angularGetResponseHeader from '../legacy/handlebars/compiled/core/angular/getResponseHeader.js';
// @ts-expect-error
import angularRequest from '../legacy/handlebars/compiled/core/angular/request.js';
// @ts-expect-error
import angularSendRequest from '../legacy/handlebars/compiled/core/angular/sendRequest.js';
// @ts-expect-error
import templateCoreApiError from '../legacy/handlebars/compiled/core/ApiError.js';
// @ts-expect-error
import templateCoreApiRequestOptions from '../legacy/handlebars/compiled/core/ApiRequestOptions.js';
// @ts-expect-error
import templateCoreApiResult from '../legacy/handlebars/compiled/core/ApiResult.js';
// @ts-expect-error
import axiosGetHeaders from '../legacy/handlebars/compiled/core/axios/getHeaders.js';
// @ts-expect-error
import axiosGetRequestBody from '../legacy/handlebars/compiled/core/axios/getRequestBody.js';
// @ts-expect-error
import axiosGetResponseBody from '../legacy/handlebars/compiled/core/axios/getResponseBody.js';
// @ts-expect-error
import axiosGetResponseHeader from '../legacy/handlebars/compiled/core/axios/getResponseHeader.js';
// @ts-expect-error
import axiosRequest from '../legacy/handlebars/compiled/core/axios/request.js';
// @ts-expect-error
import axiosSendRequest from '../legacy/handlebars/compiled/core/axios/sendRequest.js';
// @ts-expect-error
import templateCoreBaseHttpRequest from '../legacy/handlebars/compiled/core/BaseHttpRequest.js';
// @ts-expect-error
import templateCancelablePromise from '../legacy/handlebars/compiled/core/CancelablePromise.js';
// @ts-expect-error
import fetchGetHeaders from '../legacy/handlebars/compiled/core/fetch/getHeaders.js';
// @ts-expect-error
import fetchGetRequestBody from '../legacy/handlebars/compiled/core/fetch/getRequestBody.js';
// @ts-expect-error
import fetchGetResponseBody from '../legacy/handlebars/compiled/core/fetch/getResponseBody.js';
// @ts-expect-error
import fetchGetResponseHeader from '../legacy/handlebars/compiled/core/fetch/getResponseHeader.js';
// @ts-expect-error
import fetchRequest from '../legacy/handlebars/compiled/core/fetch/request.js';
// @ts-expect-error
import fetchSendRequest from '../legacy/handlebars/compiled/core/fetch/sendRequest.js';
// @ts-expect-error
import functionBase64 from '../legacy/handlebars/compiled/core/functions/base64.js';
// @ts-expect-error
import functionCatchErrorCodes from '../legacy/handlebars/compiled/core/functions/catchErrorCodes.js';
// @ts-expect-error
import functionGetFormData from '../legacy/handlebars/compiled/core/functions/getFormData.js';
// @ts-expect-error
import functionGetQueryString from '../legacy/handlebars/compiled/core/functions/getQueryString.js';
// @ts-expect-error
import functionGetUrl from '../legacy/handlebars/compiled/core/functions/getUrl.js';
// @ts-expect-error
import functionIsBlob from '../legacy/handlebars/compiled/core/functions/isBlob.js';
// @ts-expect-error
import functionIsFormData from '../legacy/handlebars/compiled/core/functions/isFormData.js';
// @ts-expect-error
import functionIsString from '../legacy/handlebars/compiled/core/functions/isString.js';
// @ts-expect-error
import functionIsStringWithValue from '../legacy/handlebars/compiled/core/functions/isStringWithValue.js';
// @ts-expect-error
import functionIsSuccess from '../legacy/handlebars/compiled/core/functions/isSuccess.js';
// @ts-expect-error
import functionResolve from '../legacy/handlebars/compiled/core/functions/resolve.js';
// @ts-expect-error
import templateCoreHttpRequest from '../legacy/handlebars/compiled/core/HttpRequest.js';
// @ts-expect-error
import templateCoreSettings from '../legacy/handlebars/compiled/core/OpenAPI.js';
// @ts-expect-error
import templateCoreRequest from '../legacy/handlebars/compiled/core/request.js';
// @ts-expect-error
import xhrGetHeaders from '../legacy/handlebars/compiled/core/xhr/getHeaders.js';
// @ts-expect-error
import xhrGetRequestBody from '../legacy/handlebars/compiled/core/xhr/getRequestBody.js';
// @ts-expect-error
import xhrGetResponseBody from '../legacy/handlebars/compiled/core/xhr/getResponseBody.js';
// @ts-expect-error
import xhrGetResponseHeader from '../legacy/handlebars/compiled/core/xhr/getResponseHeader.js';
// @ts-expect-error
import xhrRequest from '../legacy/handlebars/compiled/core/xhr/request.js';
// @ts-expect-error
import xhrSendRequest from '../legacy/handlebars/compiled/core/xhr/sendRequest.js';
import { getConfig } from './config';
import { stringCase } from './stringCase';
import { transformClassName } from './transform';

export const registerHandlebarHelpers = (): void => {
  Handlebars.registerHelper(
    'camelCase',
    function (this: unknown, name: string) {
      return stringCase({
        case: 'camelCase',
        value: name,
      });
    },
  );

  Handlebars.registerHelper(
    'equals',
    function (
      this: unknown,
      a: string,
      b: string,
      options: Handlebars.HelperOptions,
    ) {
      return a === b ? options.fn(this) : options.inverse(this);
    },
  );

  Handlebars.registerHelper(
    'ifServicesResponse',
    function (this: unknown, value: string, options: Handlebars.HelperOptions) {
      return getConfig().plugins['@hey-api/sdk']?.response === value
        ? options.fn(this)
        : options.inverse(this);
    },
  );

  Handlebars.registerHelper('ifdef', function (this: unknown, ...args): string {
    const options = args.pop();
    if (!args.every((value) => !value)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper(
    'notEquals',
    function (
      this: unknown,
      a: string,
      b: string,
      options: Handlebars.HelperOptions,
    ) {
      return a !== b ? options.fn(this) : options.inverse(this);
    },
  );

  Handlebars.registerHelper(
    'transformServiceName',
    function (this: unknown, name: string) {
      return transformClassName({
        config: getConfig(),
        name,
      });
    },
  );
};

export interface Templates {
  client: Handlebars.TemplateDelegate;
  core: {
    apiError: Handlebars.TemplateDelegate;
    apiRequestOptions: Handlebars.TemplateDelegate;
    apiResult: Handlebars.TemplateDelegate;
    baseHttpRequest: Handlebars.TemplateDelegate;
    cancelablePromise: Handlebars.TemplateDelegate;
    httpRequest: Handlebars.TemplateDelegate;
    request: Handlebars.TemplateDelegate;
    settings: Handlebars.TemplateDelegate;
  };
}

/**
 * Read all the Handlebar templates that we need and return a wrapper object
 * so we can easily access the templates in our generator/write functions.
 */
export const registerHandlebarTemplates = (): Templates => {
  registerHandlebarHelpers();

  // Main templates (entry points for the files we write to disk)
  const templates: Templates = {
    client: Handlebars.template(templateClient),
    core: {
      apiError: Handlebars.template(templateCoreApiError),
      apiRequestOptions: Handlebars.template(templateCoreApiRequestOptions),
      apiResult: Handlebars.template(templateCoreApiResult),
      baseHttpRequest: Handlebars.template(templateCoreBaseHttpRequest),
      cancelablePromise: Handlebars.template(templateCancelablePromise),
      httpRequest: Handlebars.template(templateCoreHttpRequest),
      request: Handlebars.template(templateCoreRequest),
      settings: Handlebars.template(templateCoreSettings),
    },
  };

  // Generic functions used in 'request' file @see src/legacy/handlebars/templates/core/request.hbs for more info
  Handlebars.registerPartial(
    'functions/base64',
    Handlebars.template(functionBase64),
  );
  Handlebars.registerPartial(
    'functions/catchErrorCodes',
    Handlebars.template(functionCatchErrorCodes),
  );
  Handlebars.registerPartial(
    'functions/getFormData',
    Handlebars.template(functionGetFormData),
  );
  Handlebars.registerPartial(
    'functions/getQueryString',
    Handlebars.template(functionGetQueryString),
  );
  Handlebars.registerPartial(
    'functions/getUrl',
    Handlebars.template(functionGetUrl),
  );
  Handlebars.registerPartial(
    'functions/isBlob',
    Handlebars.template(functionIsBlob),
  );
  Handlebars.registerPartial(
    'functions/isFormData',
    Handlebars.template(functionIsFormData),
  );
  Handlebars.registerPartial(
    'functions/isString',
    Handlebars.template(functionIsString),
  );
  Handlebars.registerPartial(
    'functions/isStringWithValue',
    Handlebars.template(functionIsStringWithValue),
  );
  Handlebars.registerPartial(
    'functions/isSuccess',
    Handlebars.template(functionIsSuccess),
  );
  Handlebars.registerPartial(
    'functions/resolve',
    Handlebars.template(functionResolve),
  );

  // Specific files for the fetch client implementation
  Handlebars.registerPartial(
    'fetch/getHeaders',
    Handlebars.template(fetchGetHeaders),
  );
  Handlebars.registerPartial(
    'fetch/getRequestBody',
    Handlebars.template(fetchGetRequestBody),
  );
  Handlebars.registerPartial(
    'fetch/getResponseBody',
    Handlebars.template(fetchGetResponseBody),
  );
  Handlebars.registerPartial(
    'fetch/getResponseHeader',
    Handlebars.template(fetchGetResponseHeader),
  );
  Handlebars.registerPartial(
    'fetch/request',
    Handlebars.template(fetchRequest),
  );
  Handlebars.registerPartial(
    'fetch/sendRequest',
    Handlebars.template(fetchSendRequest),
  );

  // Specific files for the xhr client implementation
  Handlebars.registerPartial(
    'xhr/getHeaders',
    Handlebars.template(xhrGetHeaders),
  );
  Handlebars.registerPartial(
    'xhr/getRequestBody',
    Handlebars.template(xhrGetRequestBody),
  );
  Handlebars.registerPartial(
    'xhr/getResponseBody',
    Handlebars.template(xhrGetResponseBody),
  );
  Handlebars.registerPartial(
    'xhr/getResponseHeader',
    Handlebars.template(xhrGetResponseHeader),
  );
  Handlebars.registerPartial('xhr/request', Handlebars.template(xhrRequest));
  Handlebars.registerPartial(
    'xhr/sendRequest',
    Handlebars.template(xhrSendRequest),
  );

  // Specific files for the axios client implementation
  Handlebars.registerPartial(
    'axios/getHeaders',
    Handlebars.template(axiosGetHeaders),
  );
  Handlebars.registerPartial(
    'axios/getRequestBody',
    Handlebars.template(axiosGetRequestBody),
  );
  Handlebars.registerPartial(
    'axios/getResponseBody',
    Handlebars.template(axiosGetResponseBody),
  );
  Handlebars.registerPartial(
    'axios/getResponseHeader',
    Handlebars.template(axiosGetResponseHeader),
  );
  Handlebars.registerPartial(
    'axios/request',
    Handlebars.template(axiosRequest),
  );
  Handlebars.registerPartial(
    'axios/sendRequest',
    Handlebars.template(axiosSendRequest),
  );

  // Specific files for the angular client implementation
  Handlebars.registerPartial(
    'angular/getHeaders',
    Handlebars.template(angularGetHeaders),
  );
  Handlebars.registerPartial(
    'angular/getRequestBody',
    Handlebars.template(angularGetRequestBody),
  );
  Handlebars.registerPartial(
    'angular/getResponseBody',
    Handlebars.template(angularGetResponseBody),
  );
  Handlebars.registerPartial(
    'angular/getResponseHeader',
    Handlebars.template(angularGetResponseHeader),
  );
  Handlebars.registerPartial(
    'angular/request',
    Handlebars.template(angularRequest),
  );
  Handlebars.registerPartial(
    'angular/sendRequest',
    Handlebars.template(angularSendRequest),
  );

  return templates;
};
