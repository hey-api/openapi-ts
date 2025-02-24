import { promises as fs } from 'fs';
import Handlebars from 'handlebars';

import { getConfig } from './config';
import { stringCase } from './stringCase';
import { transformServiceName } from './transform';

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
      return transformServiceName({
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

async function compileHbs(fileName: string) {
  const template = await fs.readFile(fileName, 'utf8').toString().trim();

  const compiled = Handlebars.compile(template, {
    knownHelpers: {
      camelCase: true,
      equals: true,
      ifServicesResponse: true,
      ifdef: true,
      notEquals: true,
      transformServiceName: true,
    },
    knownHelpersOnly: true,
    noEscape: true,
    preventIndent: true,
    strict: true,
  });

  return compiled;
}

/**
 * Read all the Handlebar templates that we need and return a wrapper object
 * so we can easily access the templates in our generator/write functions.
 */
export const registerHandlebarTemplates = async (
  templatesPath = 'node_modules/@hey-api/openapi-ts/templates',
): Promise<Templates> => {
  registerHandlebarHelpers();

  const templateClient = await compileHbs(templatesPath + '/client.hbs');
  const templateCoreApiError = await compileHbs(
    templatesPath + '/core/ApiError.hbs',
  );
  const templateCoreApiRequestOptions = await compileHbs(
    templatesPath + '/core/ApiRequestOptions.hbs',
  );
  const templateCoreApiResult = await compileHbs(
    templatesPath + '/core/ApiResult.hbs',
  );
  const templateCoreBaseHttpRequest = await compileHbs(
    templatesPath + '/core/BaseHttpRequest.hbs',
  );
  const templateCancelablePromise = await compileHbs(
    templatesPath + '/core/CancelablePromise.hbs',
  );
  const templateCoreHttpRequest = await compileHbs(
    templatesPath + '/core/HttpRequest.hbs',
  );
  const templateCoreRequest = await compileHbs(
    templatesPath + '/core/request.hbs',
  );
  const templateCoreSettings = await compileHbs(
    templatesPath + '/core/OpenAPI.hbs',
  );
  // Main templates (entry points for the files we write to disk)
  const templates: Templates = {
    client: templateClient,
    core: {
      apiError: templateCoreApiError,
      apiRequestOptions: templateCoreApiRequestOptions,
      apiResult: templateCoreApiResult,
      baseHttpRequest: templateCoreBaseHttpRequest,
      cancelablePromise: templateCancelablePromise,
      httpRequest: templateCoreHttpRequest,
      request: templateCoreRequest,
      settings: templateCoreSettings,
    },
  };

  const functionBase64 = await compileHbs(
    templatesPath + '/core/functions/base64.hbs',
  );
  const functionCatchErrorCodes = await compileHbs(
    templatesPath + '/core/functions/catchErrorCodes.hbs',
  );
  const functionGetFormData = await compileHbs(
    templatesPath + '/core/functions/getFormData.hbs',
  );
  const functionGetQueryString = await compileHbs(
    templatesPath + '/core/functions/getQueryString.hbs',
  );
  const functionGetUrl = await compileHbs(
    templatesPath + '/core/functions/getUrl.hbs',
  );
  const functionIsBlob = await compileHbs(
    templatesPath + '/core/functions/isBlob.hbs',
  );
  const functionIsFormData = await compileHbs(
    templatesPath + '/core/functions/isFormData.hbs',
  );
  const functionIsString = await compileHbs(
    templatesPath + '/core/functions/isString.hbs',
  );
  const functionIsStringWithValue = await compileHbs(
    templatesPath + '/core/functions/isStringWithValue.hbs',
  );
  const functionIsSuccess = await compileHbs(
    templatesPath + '/core/functions/isSuccess.hbs',
  );
  const functionResolve = await compileHbs(
    templatesPath + '/core/functions/resolve.hbs',
  );
  // Generic functions used in 'request' file @see src/legacy/handlebars/templates/core/request.hbs for more info
  Handlebars.registerPartial('functions/base64', functionBase64);
  Handlebars.registerPartial(
    'functions/catchErrorCodes',
    functionCatchErrorCodes,
  );
  Handlebars.registerPartial('functions/getFormData', functionGetFormData);
  Handlebars.registerPartial(
    'functions/getQueryString',
    functionGetQueryString,
  );
  Handlebars.registerPartial('functions/getUrl', functionGetUrl);
  Handlebars.registerPartial('functions/isBlob', functionIsBlob);
  Handlebars.registerPartial('functions/isFormData', functionIsFormData);
  Handlebars.registerPartial('functions/isString', functionIsString);
  Handlebars.registerPartial(
    'functions/isStringWithValue',
    functionIsStringWithValue,
  );
  Handlebars.registerPartial('functions/isSuccess', functionIsSuccess);
  Handlebars.registerPartial('functions/resolve', functionResolve);

  const fetchGetHeaders = await compileHbs(
    templatesPath + '/core/fetch/getHeaders.hbs',
  );
  const fetchGetRequestBody = await compileHbs(
    templatesPath + '/core/fetch/getRequestBody.hbs',
  );
  const fetchGetResponseBody = await compileHbs(
    templatesPath + '/core/fetch/getResponseBody.hbs',
  );
  const fetchGetResponseHeader = await compileHbs(
    templatesPath + '/core/fetch/getResponseHeader.hbs',
  );
  const fetchRequest = await compileHbs(
    templatesPath + '/core/fetch/request.hbs',
  );
  const fetchSendRequest = await compileHbs(
    templatesPath + '/core/fetch/sendRequest.hbs',
  );
  // Specific files for the fetch client implementation
  Handlebars.registerPartial('fetch/getHeaders', fetchGetHeaders);
  Handlebars.registerPartial('fetch/getRequestBody', fetchGetRequestBody);
  Handlebars.registerPartial('fetch/getResponseBody', fetchGetResponseBody);
  Handlebars.registerPartial('fetch/getResponseHeader', fetchGetResponseHeader);
  Handlebars.registerPartial('fetch/request', fetchRequest);
  Handlebars.registerPartial('fetch/sendRequest', fetchSendRequest);

  const xhrGetHeaders = await compileHbs(
    templatesPath + '/core/xhr/getHeaders.hbs',
  );
  const xhrGetRequestBody = await compileHbs(
    templatesPath + '/core/xhr/getRequestBody.hbs',
  );
  const xhrGetResponseBody = await compileHbs(
    templatesPath + '/core/xhr/getResponseBody.hbs',
  );
  const xhrGetResponseHeader = await compileHbs(
    templatesPath + '/core/xhr/getResponseHeader.hbs',
  );
  const xhrRequest = await compileHbs(templatesPath + '/core/xhr/request.hbs');
  const xhrSendRequest = await compileHbs(
    templatesPath + '/core/xhr/sendRequest.hbs',
  );
  // Specific files for the xhr client implementation
  Handlebars.registerPartial('xhr/getHeaders', xhrGetHeaders);
  Handlebars.registerPartial('xhr/getRequestBody', xhrGetRequestBody);
  Handlebars.registerPartial('xhr/getResponseBody', xhrGetResponseBody);
  Handlebars.registerPartial('xhr/getResponseHeader', xhrGetResponseHeader);
  Handlebars.registerPartial('xhr/request', xhrRequest);
  Handlebars.registerPartial('xhr/sendRequest', xhrSendRequest);

  const axiosGetHeaders = await compileHbs(
    templatesPath + '/core/axios/getHeaders.hbs',
  );
  const axiosGetRequestBody = await compileHbs(
    templatesPath + '/core/axios/getRequestBody.hbs',
  );
  const axiosGetResponseBody = await compileHbs(
    templatesPath + '/core/axios/getResponseBody.hbs',
  );
  const axiosGetResponseHeader = await compileHbs(
    templatesPath + '/core/axios/getResponseHeader.hbs',
  );
  const axiosRequest = await compileHbs(
    templatesPath + '/core/axios/request.hbs',
  );
  const axiosSendRequest = await compileHbs(
    templatesPath + '/core/axios/sendRequest.hbs',
  );
  // Specific files for the axios client implementation
  Handlebars.registerPartial('axios/getHeaders', axiosGetHeaders);
  Handlebars.registerPartial('axios/getRequestBody', axiosGetRequestBody);
  Handlebars.registerPartial('axios/getResponseBody', axiosGetResponseBody);
  Handlebars.registerPartial('axios/getResponseHeader', axiosGetResponseHeader);
  Handlebars.registerPartial('axios/request', axiosRequest);
  Handlebars.registerPartial('axios/sendRequest', axiosSendRequest);

  const angularGetHeaders = await compileHbs(
    templatesPath + '/core/angular/getHeaders.hbs',
  );
  const angularGetRequestBody = await compileHbs(
    templatesPath + '/core/angular/getRequestBody.hbs',
  );
  const angularGetResponseBody = await compileHbs(
    templatesPath + '/core/angular/getResponseBody.hbs',
  );
  const angularGetResponseHeader = await compileHbs(
    templatesPath + '/core/angular/getResponseHeader.hbs',
  );
  const angularRequest = await compileHbs(
    templatesPath + '/core/angular/request.hbs',
  );
  const angularSendRequest = await compileHbs(
    templatesPath + '/core/angular/sendRequest.hbs',
  );
  // Specific files for the angular client implementation
  Handlebars.registerPartial('angular/getHeaders', angularGetHeaders);
  Handlebars.registerPartial('angular/getRequestBody', angularGetRequestBody);
  Handlebars.registerPartial('angular/getResponseBody', angularGetResponseBody);
  Handlebars.registerPartial(
    'angular/getResponseHeader',
    angularGetResponseHeader,
  );
  Handlebars.registerPartial('angular/request', angularRequest);
  Handlebars.registerPartial('angular/sendRequest', angularSendRequest);

  return templates;
};
