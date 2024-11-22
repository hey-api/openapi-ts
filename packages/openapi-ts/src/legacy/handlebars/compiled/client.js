export default {
  1: function (container, depth0, helpers, partials, data) {
    return "import { NgModule} from '@angular/core';\nimport { HttpClientModule } from '@angular/common/http';\n\nimport { AngularHttpRequest } from './core/AngularHttpRequest';\nimport { BaseHttpRequest } from './core/BaseHttpRequest';\nimport type { OpenAPIConfig } from './core/OpenAPI';\nimport { OpenAPI } from './core/OpenAPI';\nimport { Interceptors } from './core/OpenAPI';\n";
  },
  3: function (container, depth0, helpers, partials, data) {
    var stack1,
      alias1 = container.strict,
      alias2 = container.lambda;

    return (
      "import type { BaseHttpRequest } from './core/BaseHttpRequest';\nimport type { OpenAPIConfig } from './core/OpenAPI';\nimport { Interceptors } from './core/OpenAPI';\nimport { " +
      ((stack1 = alias2(
        alias1(depth0, 'httpRequest', {
          start: { line: 14, column: 12 },
          end: { line: 14, column: 23 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      " } from './core/" +
      ((stack1 = alias2(
        alias1(depth0, 'httpRequest', {
          start: { line: 14, column: 45 },
          end: { line: 14, column: 56 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "';\n"
    );
  },
  5: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (stack1 = lookupProperty(helpers, 'each').call(
      depth0 != null ? depth0 : container.nullContext || {},
      lookupProperty(depth0, 'services'),
      {
        name: 'each',
        hash: {},
        fn: container.program(6, data, 0),
        inverse: container.noop,
        data: data,
        loc: { start: { line: 18, column: 0 }, end: { line: 20, column: 9 } },
      },
    )) != null
      ? stack1
      : '';
  },
  6: function (container, depth0, helpers, partials, data) {
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
      'import { ' +
      ((stack1 = lookupProperty(helpers, 'transformServiceName').call(
        depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty(depth0, 'name'),
        {
          name: 'transformServiceName',
          hash: {},
          data: data,
          loc: {
            start: { line: 19, column: 9 },
            end: { line: 19, column: 40 },
          },
        },
      )) != null
        ? stack1
        : '') +
      " } from './sdk.gen';\n"
    );
  },
  8: function (container, depth0, helpers, partials, data) {
    var stack1,
      alias1 = container.strict,
      alias2 = container.lambda,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      "@NgModule({\n	imports: [HttpClientModule],\n	providers: [\n		{\n			provide: OpenAPI,\n			useValue: {\n				BASE: OpenAPI?.BASE ?? '" +
      ((stack1 = alias2(
        alias1(depth0, 'server', {
          start: { line: 30, column: 31 },
          end: { line: 30, column: 37 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "',\n				VERSION: OpenAPI?.VERSION ?? '" +
      ((stack1 = alias2(
        alias1(depth0, 'version', {
          start: { line: 31, column: 37 },
          end: { line: 31, column: 44 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "',\n				WITH_CREDENTIALS: OpenAPI?.WITH_CREDENTIALS ?? false,\n				CREDENTIALS: OpenAPI?.CREDENTIALS ?? 'include',\n				TOKEN: OpenAPI?.TOKEN,\n				USERNAME: OpenAPI?.USERNAME,\n				PASSWORD: OpenAPI?.PASSWORD,\n				HEADERS: OpenAPI?.HEADERS,\n				ENCODE_PATH: OpenAPI?.ENCODE_PATH,\n				interceptors: {\n					response: OpenAPI?.interceptors?.response ?? new Interceptors(),\n				},\n			} as OpenAPIConfig,\n		},\n		{\n			provide: BaseHttpRequest,\n			useClass: AngularHttpRequest,\n		},\n" +
      ((stack1 = lookupProperty(helpers, 'each').call(
        depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty(depth0, 'services'),
        {
          name: 'each',
          hash: {},
          fn: container.program(9, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 48, column: 2 },
            end: { line: 50, column: 11 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '	]\n})\nexport class ' +
      ((stack1 = alias2(
        alias1(
          lookupProperty(lookupProperty(data, 'root'), '$config'),
          'name',
          { start: { line: 53, column: 16 }, end: { line: 53, column: 34 } },
        ),
        depth0,
      )) != null
        ? stack1
        : '') +
      ' {}\n'
    );
  },
  9: function (container, depth0, helpers, partials, data) {
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
      '		' +
      ((stack1 = lookupProperty(helpers, 'transformServiceName').call(
        depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty(depth0, 'name'),
        {
          name: 'transformServiceName',
          hash: {},
          data: data,
          loc: {
            start: { line: 49, column: 2 },
            end: { line: 49, column: 33 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ',\n'
    );
  },
  11: function (container, depth0, helpers, partials, data) {
    var stack1,
      alias1 = container.strict,
      alias2 = container.lambda,
      alias3 = depth0 != null ? depth0 : container.nullContext || {},
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      'type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;\n\nexport class ' +
      ((stack1 = alias2(
        alias1(
          lookupProperty(lookupProperty(data, 'root'), '$config'),
          'name',
          { start: { line: 57, column: 16 }, end: { line: 57, column: 34 } },
        ),
        depth0,
      )) != null
        ? stack1
        : '') +
      ' {\n\n' +
      ((stack1 = lookupProperty(helpers, 'each').call(
        alias3,
        lookupProperty(depth0, 'services'),
        {
          name: 'each',
          hash: {},
          fn: container.program(12, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 59, column: 1 },
            end: { line: 61, column: 10 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '\n	public readonly request: BaseHttpRequest;\n\n	constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = ' +
      ((stack1 = alias2(
        alias1(depth0, 'httpRequest', {
          start: { line: 65, column: 87 },
          end: { line: 65, column: 98 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      ") {\n		this.request = new HttpRequest({\n			BASE: config?.BASE ?? '" +
      ((stack1 = alias2(
        alias1(depth0, 'server', {
          start: { line: 67, column: 29 },
          end: { line: 67, column: 35 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "',\n			VERSION: config?.VERSION ?? '" +
      ((stack1 = alias2(
        alias1(depth0, 'version', {
          start: { line: 68, column: 35 },
          end: { line: 68, column: 42 },
        }),
        depth0,
      )) != null
        ? stack1
        : '') +
      "',\n			WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,\n			CREDENTIALS: config?.CREDENTIALS ?? 'include',\n			TOKEN: config?.TOKEN,\n			USERNAME: config?.USERNAME,\n			PASSWORD: config?.PASSWORD,\n			HEADERS: config?.HEADERS,\n			ENCODE_PATH: config?.ENCODE_PATH,\n			interceptors: {\n				request: config?.interceptors?.request ?? new Interceptors(),\n				response: config?.interceptors?.response ?? new Interceptors(),\n      },\n		});\n\n" +
      ((stack1 = lookupProperty(helpers, 'each').call(
        alias3,
        lookupProperty(depth0, 'services'),
        {
          name: 'each',
          hash: {},
          fn: container.program(14, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 82, column: 2 },
            end: { line: 84, column: 11 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '	}\n}\n'
    );
  },
  12: function (container, depth0, helpers, partials, data) {
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
      '	public readonly ' +
      ((stack1 = lookupProperty(helpers, 'camelCase').call(
        alias1,
        lookupProperty(depth0, 'name'),
        {
          name: 'camelCase',
          hash: {},
          data: data,
          loc: {
            start: { line: 60, column: 17 },
            end: { line: 60, column: 37 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ': ' +
      ((stack1 = lookupProperty(helpers, 'transformServiceName').call(
        alias1,
        lookupProperty(depth0, 'name'),
        {
          name: 'transformServiceName',
          hash: {},
          data: data,
          loc: {
            start: { line: 60, column: 39 },
            end: { line: 60, column: 70 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ';\n'
    );
  },
  14: function (container, depth0, helpers, partials, data) {
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
      '		this.' +
      ((stack1 = lookupProperty(helpers, 'camelCase').call(
        alias1,
        lookupProperty(depth0, 'name'),
        {
          name: 'camelCase',
          hash: {},
          data: data,
          loc: {
            start: { line: 83, column: 7 },
            end: { line: 83, column: 27 },
          },
        },
      )) != null
        ? stack1
        : '') +
      ' = new ' +
      ((stack1 = lookupProperty(helpers, 'transformServiceName').call(
        alias1,
        lookupProperty(depth0, 'name'),
        {
          name: 'transformServiceName',
          hash: {},
          data: data,
          loc: {
            start: { line: 83, column: 34 },
            end: { line: 83, column: 65 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '(this.request);\n'
    );
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
          loc: { start: { line: 1, column: 0 }, end: { line: 15, column: 11 } },
        },
      )) != null
        ? stack1
        : '') +
      '\n' +
      ((stack1 = lookupProperty(helpers, 'if').call(
        alias1,
        lookupProperty(depth0, 'services'),
        {
          name: 'if',
          hash: {},
          fn: container.program(5, data, 0),
          inverse: container.noop,
          data: data,
          loc: { start: { line: 17, column: 0 }, end: { line: 21, column: 7 } },
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
          fn: container.program(8, data, 0),
          inverse: container.program(11, data, 0),
          data: data,
          loc: {
            start: { line: 23, column: 0 },
            end: { line: 87, column: 11 },
          },
        },
      )) != null
        ? stack1
        : '')
    );
  },
  useData: true,
};
