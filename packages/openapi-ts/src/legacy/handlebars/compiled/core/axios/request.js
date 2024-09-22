export default {
  1: function (container, depth0, helpers, partials, data) {
    return 'ApiResult<T>';
  },
  3: function (container, depth0, helpers, partials, data) {
    return 'T';
  },
  5: function (container, depth0, helpers, partials, data) {
    return 'result.body';
  },
  7: function (container, depth0, helpers, partials, data) {
    return 'result';
  },
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      "import axios from 'axios';\nimport type { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n" +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/isString'),
        depth0,
        {
          name: 'functions/isString',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/isStringWithValue'),
        depth0,
        {
          name: 'functions/isStringWithValue',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/isBlob'),
        depth0,
        {
          name: 'functions/isBlob',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/isFormData'),
        depth0,
        {
          name: 'functions/isFormData',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/isSuccess'),
        depth0,
        {
          name: 'functions/isSuccess',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/base64'),
        depth0,
        {
          name: 'functions/base64',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/getQueryString'),
        depth0,
        {
          name: 'functions/getQueryString',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/getUrl'),
        depth0,
        {
          name: 'functions/getUrl',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/getFormData'),
        depth0,
        {
          name: 'functions/getFormData',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/resolve'),
        depth0,
        {
          name: 'functions/resolve',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'axios/getHeaders'),
        depth0,
        {
          name: 'axios/getHeaders',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'axios/getRequestBody'),
        depth0,
        {
          name: 'axios/getRequestBody',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'axios/sendRequest'),
        depth0,
        {
          name: 'axios/sendRequest',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'axios/getResponseHeader'),
        depth0,
        {
          name: 'axios/getResponseHeader',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'axios/getResponseBody'),
        depth0,
        {
          name: 'axios/getResponseBody',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n' +
      ((stack1 = container.invokePartial(
        lookupProperty(partials, 'functions/catchErrorCodes'),
        depth0,
        {
          name: 'functions/catchErrorCodes',
          data: data,
          helpers: helpers,
          partials: partials,
          decorators: container.decorators,
        },
      )) != null
        ? stack1
        : '') +
      '\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param options The request options from the service\n * @param axiosClient The axios client instance to use\n * @returns CancelablePromise<' +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'services',
          ),
          'response',
        ),
        'response',
        {
          name: 'equals',
          hash: {},
          fn: container.program(1, data, 0),
          inverse: container.program(3, data, 0),
          data: data,
          loc: {
            start: { line: 64, column: 30 },
            end: { line: 64, column: 116 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions<T>, axiosClient: AxiosInstance = axios): CancelablePromise<' +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'services',
          ),
          'response',
        ),
        'response',
        {
          name: 'equals',
          hash: {},
          fn: container.program(1, data, 0),
          inverse: container.program(3, data, 0),
          data: data,
          loc: {
            start: { line: 67, column: 136 },
            end: { line: 67, column: 222 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '> => {\n	return new CancelablePromise(async (resolve, reject, onCancel) => {\n		try {\n			const url = getUrl(config, options);\n			const formData = getFormData(options);\n			const body = getRequestBody(options);\n			const headers = await getHeaders(config, options);\n\n			if (!onCancel.isCancelled) {\n				let response = await sendRequest<T>(config, options, url, body, formData, headers, onCancel, axiosClient);\n\n				for (const fn of config.interceptors.response._fns) {\n					response = await fn(response);\n				}\n\n				const responseBody = getResponseBody(response);\n				const responseHeader = getResponseHeader(response, options.responseHeader);\n\n				let transformedBody = responseBody;\n				if (options.responseTransformer && isSuccess(response.status)) {\n					transformedBody = await options.responseTransformer(responseBody)\n				}\n\n				const result: ApiResult = {\n					url,\n					ok: isSuccess(response.status),\n					status: response.status,\n					statusText: response.statusText,\n					body: responseHeader ?? transformedBody,\n				};\n\n				catchErrorCodes(options, result);\n\n				resolve(' +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'services',
          ),
          'response',
        ),
        'body',
        {
          name: 'equals',
          hash: {},
          fn: container.program(5, data, 0),
          inverse: container.program(7, data, 0),
          data: data,
          loc: {
            start: { line: 100, column: 12 },
            end: { line: 100, column: 98 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ');\n			}\n		} catch (error) {\n			reject(error);\n		}\n	});\n};'
    );
  },
  usePartial: true,
  useData: true,
};
