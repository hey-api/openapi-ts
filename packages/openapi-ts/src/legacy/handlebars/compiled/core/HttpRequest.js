export default {
  1: function (container, depth0, helpers, partials, data) {
    return "import { Inject, Injectable } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport type { Observable } from 'rxjs';\n\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport { BaseHttpRequest } from './BaseHttpRequest';\nimport type { OpenAPIConfig } from './OpenAPI';\nimport { OpenAPI } from './OpenAPI';\nimport { request as __request } from './request';\n";
  },
  3: function (container, depth0, helpers, partials, data) {
    return "import type { ApiRequestOptions } from './ApiRequestOptions';\nimport { BaseHttpRequest } from './BaseHttpRequest';\nimport type { CancelablePromise } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\nimport { request as __request } from './request';\n";
  },
  5: function (container, depth0, helpers, partials, data) {
    return '@Injectable()\n';
  },
  7: function (container, depth0, helpers, partials, data) {
    return '	constructor(\n		@Inject(OpenAPI)\n		config: OpenAPIConfig,\n		http: HttpClient,\n	) {\n		super(config, http);\n	}\n';
  },
  9: function (container, depth0, helpers, partials, data) {
    return '	constructor(config: OpenAPIConfig) {\n		super(config);\n	}\n';
  },
  11: function (container, depth0, helpers, partials, data) {
    return '	/**\n	 * Request method\n	 * @param options The request options from the service\n	 * @returns Observable<T>\n	 * @throws ApiError\n	 */\n	public override request<T>(options: ApiRequestOptions<T>): Observable<T> {\n		return __request(this.config, this.http, options);\n	}\n';
  },
  13: function (container, depth0, helpers, partials, data) {
    return '	/**\n	 * Request method\n	 * @param options The request options from the service\n	 * @returns CancelablePromise<T>\n	 * @throws ApiError\n	 */\n	public override request<T>(options: ApiRequestOptions<T>): CancelablePromise<T> {\n		return __request(this.config, options);\n	}\n';
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
          inverse: container.program(3, data, 0),
          data: data,
          loc: { start: { line: 1, column: 0 }, end: { line: 17, column: 11 } },
        },
      )) != null
        ? stack1
        : '') +
      '\n' +
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
          fn: container.program(5, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 19, column: 0 },
            end: { line: 21, column: 11 },
          },
        },
      )) != null
        ? stack1
        : '') +
      'export class ' +
      ((stack1 = container.lambda(
        container.strict(depth0, 'httpRequest', {
          start: { line: 22, column: 15 },
          end: { line: 22, column: 26 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      ' extends BaseHttpRequest {\n\n' +
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
          inverse: container.program(9, data, 0),
          data: data,
          loc: {
            start: { line: 24, column: 1 },
            end: { line: 36, column: 12 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '\n' +
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
          fn: container.program(11, data, 0),
          inverse: container.program(13, data, 0),
          data: data,
          loc: {
            start: { line: 38, column: 1 },
            end: { line: 58, column: 12 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '}'
    );
  },
  useData: true,
};
