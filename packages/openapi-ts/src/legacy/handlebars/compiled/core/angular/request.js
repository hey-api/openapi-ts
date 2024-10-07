export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      "import { HttpClient, HttpHeaders } from '@angular/common/http';\nimport type { HttpResponse, HttpErrorResponse } from '@angular/common/http';\nimport { forkJoin, of, throwError } from 'rxjs';\nimport { catchError, map, switchMap } from 'rxjs/operators';\nimport type { Observable } from 'rxjs';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport type { OpenAPIConfig } from './OpenAPI';\n\n" +
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
        lookupProperty(partials, 'angular/getHeaders'),
        depth0,
        {
          name: 'angular/getHeaders',
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
        lookupProperty(partials, 'angular/getRequestBody'),
        depth0,
        {
          name: 'angular/getRequestBody',
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
        lookupProperty(partials, 'angular/sendRequest'),
        depth0,
        {
          name: 'angular/sendRequest',
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
        lookupProperty(partials, 'angular/getResponseHeader'),
        depth0,
        {
          name: 'angular/getResponseHeader',
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
        lookupProperty(partials, 'angular/getResponseBody'),
        depth0,
        {
          name: 'angular/getResponseBody',
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
      '\n\n/**\n * Request method\n * @param config The OpenAPI configuration object\n * @param http The Angular HTTP client\n * @param options The request options from the service\n * @returns Observable<T>\n * @throws ApiError\n */\nexport const request = <T>(config: OpenAPIConfig, http: HttpClient, options: ApiRequestOptions<T>): Observable<T> => {\n	const url = getUrl(config, options);\n	const formData = getFormData(options);\n	const body = getRequestBody(options);\n\n	return getHeaders(config, options).pipe(\n		switchMap(headers => {\n			return sendRequest<T>(config, options, http, url, body, formData, headers);\n		}),\n		switchMap(async response => {\n			for (const fn of config.interceptors.response._fns) {\n				response = await fn(response);\n			}\n			const responseBody = getResponseBody(response);\n			const responseHeader = getResponseHeader(response, options.responseHeader);\n\n			let transformedBody = responseBody;\n			if (options.responseTransformer && response.ok) {\n				transformedBody = await options.responseTransformer(responseBody)\n			}\n\n			return {\n				url,\n				ok: response.ok,\n				status: response.status,\n				statusText: response.statusText,\n				body: responseHeader ?? transformedBody,\n			} as ApiResult;\n		}),\n		catchError((error: HttpErrorResponse) => {\n			if (!error.status) {\n				return throwError(() => error);\n			}\n			return of({\n				url,\n				ok: error.ok,\n				status: error.status,\n				statusText: error.statusText,\n				body: error.error ?? error.statusText,\n			} as ApiResult);\n		}),\n		map(result => {\n			catchErrorCodes(options, result);\n			return result.body as T;\n		}),\n		catchError((error: ApiError) => {\n			return throwError(() => error);\n		}),\n	);\n};'
    );
  },
  usePartial: true,
  useData: true,
};
