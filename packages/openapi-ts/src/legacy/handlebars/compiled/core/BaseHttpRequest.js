export default {
  1: function (container, depth0, helpers, partials, data) {
    return "import type { HttpClient } from '@angular/common/http';\nimport type { Observable } from 'rxjs';\n\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { OpenAPIConfig } from './OpenAPI';\n";
  },
  3: function (container, depth0, helpers, partials, data) {
    return "import type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { CancelablePromise } from './CancelablePromise';\nimport type { OpenAPIConfig } from './OpenAPI';\n";
  },
  5: function (container, depth0, helpers, partials, data) {
    return '	constructor(\n		public readonly config: OpenAPIConfig,\n		public readonly http: HttpClient,\n	) {}\n';
  },
  7: function (container, depth0, helpers, partials, data) {
    return '	constructor(public readonly config: OpenAPIConfig) {}\n';
  },
  9: function (container, depth0, helpers, partials, data) {
    return '	public abstract request<T>(options: ApiRequestOptions<T>): Observable<T>;\n';
  },
  11: function (container, depth0, helpers, partials, data) {
    return '	public abstract request<T>(options: ApiRequestOptions<T>): CancelablePromise<T>;\n';
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
          loc: { start: { line: 1, column: 0 }, end: { line: 11, column: 11 } },
        },
      )) != null
        ? stack1
        : '') +
      '\nexport abstract class BaseHttpRequest {\n\n' +
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
          inverse: container.program(7, data, 0),
          data: data,
          loc: {
            start: { line: 15, column: 1 },
            end: { line: 22, column: 12 },
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
          fn: container.program(9, data, 0),
          inverse: container.program(11, data, 0),
          data: data,
          loc: {
            start: { line: 24, column: 1 },
            end: { line: 28, column: 12 },
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
