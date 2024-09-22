export default {
  1: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (stack1 = container.invokePartial(
      lookupProperty(partials, 'angular/request'),
      depth0,
      {
        name: 'angular/request',
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators,
      },
    )) != null
      ? stack1
      : '';
  },
  3: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (stack1 = container.invokePartial(
      lookupProperty(partials, 'axios/request'),
      depth0,
      {
        name: 'axios/request',
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators,
      },
    )) != null
      ? stack1
      : '';
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

    return (stack1 = container.invokePartial(
      lookupProperty(partials, 'fetch/request'),
      depth0,
      {
        name: 'fetch/request',
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators,
      },
    )) != null
      ? stack1
      : '';
  },
  7: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (stack1 = container.invokePartial(
      lookupProperty(partials, 'xhr/request'),
      depth0,
      {
        name: 'xhr/request',
        data: data,
        helpers: helpers,
        partials: partials,
        decorators: container.decorators,
      },
    )) != null
      ? stack1
      : '';
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
          inverse: container.noop,
          data: data,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 87 } },
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
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 83 } },
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
          fn: container.program(5, data, 0),
          inverse: container.noop,
          data: data,
          loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 83 } },
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
          loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 82 } },
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
          fn: container.program(7, data, 0),
          inverse: container.noop,
          data: data,
          loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 79 } },
        },
      )) != null
        ? stack1
        : '')
    );
  },
  usePartial: true,
  useData: true,
};
