export default {
  1: function (container, depth0, helpers, partials, data) {
    return "import type { HttpResponse } from '@angular/common/http';\n";
  },
  3: function (container, depth0, helpers, partials, data) {
    return "import type { AxiosRequestConfig, AxiosResponse } from 'axios';\n";
  },
  5: function (container, depth0, helpers, partials, data) {
    return "import type { RequestInit, Response } from 'node-fetch';\n";
  },
  7: function (container, depth0, helpers, partials, data) {
    return '		response: Interceptors<HttpResponse<any>>;\n';
  },
  9: function (container, depth0, helpers, partials, data) {
    return '		request: Interceptors<AxiosRequestConfig>;\n		response: Interceptors<AxiosResponse>;\n';
  },
  11: function (container, depth0, helpers, partials, data) {
    return '		request: Interceptors<RequestInit>;\n		response: Interceptors<Response>;\n';
  },
  13: function (container, depth0, helpers, partials, data) {
    return '		request: Interceptors<XMLHttpRequest>;\n		response: Interceptors<XMLHttpRequest>;\n';
  },
  15: function (container, depth0, helpers, partials, data) {
    return '		request: new Interceptors(),\n';
  },
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      alias1 = depth0 != null ? depth0 : container.nullContext || {},
      alias2 = container.strict,
      alias3 = container.lambda,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/angular',
        {
          name: 'equals',
          hash: {},
          fn: container.program(1, data, 0),
          inverse: container.noop,
          data: data,
          loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 11 } },
        },
      )) != null
        ? stack1
        : '') +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/axios',
        {
          name: 'equals',
          hash: {},
          fn: container.program(3, data, 0),
          inverse: container.noop,
          data: data,
          loc: { start: { line: 4, column: 0 }, end: { line: 6, column: 11 } },
        },
      )) != null
        ? stack1
        : '') +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/node',
        {
          name: 'equals',
          hash: {},
          fn: container.program(5, data, 0),
          inverse: container.noop,
          data: data,
          loc: { start: { line: 7, column: 0 }, end: { line: 9, column: 11 } },
        },
      )) != null
        ? stack1
        : '') +
      "import type { ApiRequestOptions } from './ApiRequestOptions';\n\ntype Headers = Record<string, string>;\ntype Middleware<T> = (value: T) => T | Promise<T>;\ntype Resolver<T> = (options: ApiRequestOptions<T>) => Promise<T>;\n\nexport class Interceptors<T> {\n  _fns: Middleware<T>[];\n\n  constructor() {\n    this._fns = [];\n  }\n\n  eject(fn: Middleware<T>): void {\n    const index = this._fns.indexOf(fn);\n    if (index !== -1) {\n      this._fns = [...this._fns.slice(0, index), ...this._fns.slice(index + 1)];\n    }\n  }\n\n  use(fn: Middleware<T>): void {\n    this._fns = [...this._fns, fn];\n  }\n}\n\nexport type OpenAPIConfig = {\n	BASE: string;\n	CREDENTIALS: 'include' | 'omit' | 'same-origin';\n	ENCODE_PATH?: ((path: string) => string) | undefined;\n	HEADERS?: Headers | Resolver<Headers> | undefined;\n	PASSWORD?: string | Resolver<string> | undefined;\n	TOKEN?: string | Resolver<string> | undefined;\n	USERNAME?: string | Resolver<string> | undefined;\n	VERSION: string;\n	WITH_CREDENTIALS: boolean;\n	interceptors: {\n" +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/angular',
        {
          name: 'equals',
          hash: {},
          fn: container.program(7, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 46, column: 2 },
            end: { line: 48, column: 13 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/axios',
        {
          name: 'equals',
          hash: {},
          fn: container.program(9, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 49, column: 2 },
            end: { line: 52, column: 13 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/fetch',
        {
          name: 'equals',
          hash: {},
          fn: container.program(11, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 53, column: 2 },
            end: { line: 56, column: 13 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/node',
        {
          name: 'equals',
          hash: {},
          fn: container.program(11, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 57, column: 2 },
            end: { line: 60, column: 13 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/xhr',
        {
          name: 'equals',
          hash: {},
          fn: container.program(13, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 61, column: 2 },
            end: { line: 64, column: 13 },
          },
        },
      )) != null
        ? stack1
        : '') +
      "	};\n};\n\nexport const OpenAPI: OpenAPIConfig = {\n	BASE: '" +
      ((stack1 = alias3(
        alias2(depth0, 'server', {
          start: { line: 69, column: 11 },
          end: { line: 69, column: 17 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "',\n	CREDENTIALS: 'include',\n	ENCODE_PATH: undefined,\n	HEADERS: undefined,\n	PASSWORD: undefined,\n	TOKEN: undefined,\n	USERNAME: undefined,\n	VERSION: '" +
      ((stack1 = alias3(
        alias2(depth0, 'version', {
          start: { line: 76, column: 14 },
          end: { line: 76, column: 21 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "',\n	WITH_CREDENTIALS: false,\n	interceptors: {\n" +
      ((stack1 = lookupProperty(helpers, 'notEquals').call(
        alias1,
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/angular',
        {
          name: 'notEquals',
          hash: {},
          fn: container.program(15, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 79, column: 2 },
            end: { line: 81, column: 16 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '		response: new Interceptors(),\n	},\n};'
    );
  },
  useData: true,
};
