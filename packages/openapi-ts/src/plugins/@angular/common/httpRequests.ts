import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { stringCase } from '~/utils/stringCase';

import type { AngularCommonPlugin } from './types';

interface AngularRequestClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ReturnType<typeof $.method | typeof $.field | typeof $.newline>>;
  root: boolean;
}

const generateAngularClassRequests = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const requestClasses = new Map<string, AngularRequestClassEntry>();
  const generatedClasses = new Set<string>();

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });

      const classes = operationClasses({
        context: plugin.context,
        operation,
        plugin: sdkPlugin,
      });

      for (const entry of classes.values()) {
        entry.path.forEach((currentClassName, index) => {
          if (!requestClasses.has(currentClassName)) {
            requestClasses.set(currentClassName, {
              className: currentClassName,
              classes: new Set(),
              methods: new Set(),
              nodes: [],
              root: !index,
            });
          }

          const parentClassName = entry.path[index - 1];
          if (parentClassName && parentClassName !== currentClassName) {
            const parentClass = requestClasses.get(parentClassName)!;
            parentClass.classes.add(currentClassName);
            requestClasses.set(parentClassName, parentClass);
          }

          const isLast = entry.path.length === index + 1;
          if (!isLast) {
            return;
          }

          const currentClass = requestClasses.get(currentClassName)!;

          const requestMethodName =
            plugin.config.httpRequests.methodNameBuilder(operation);

          if (currentClass.methods.has(requestMethodName)) {
            return;
          }

          const methodNode = generateAngularRequestMethod({
            isRequiredOptions,
            methodName: requestMethodName,
            operation,
            plugin,
          });

          if (!currentClass.nodes.length) {
            currentClass.nodes.push(methodNode);
          } else {
            currentClass.nodes.push($.newline(), methodNode);
          }

          currentClass.methods.add(requestMethodName);
          requestClasses.set(currentClassName, currentClass);
        });
      }
    },
    {
      order: 'declarations',
    },
  );

  const generateClass = (currentClass: AngularRequestClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = requestClasses.get(childClassName)!;
        generateClass(childClass);

        currentClass.nodes.push(
          $.field(
            stringCase({ case: 'camelCase', value: childClass.className }),
          ).assign(
            $.new(
              buildName({
                config: {
                  case: 'preserve',
                  name: plugin.config.httpRequests.classNameBuilder,
                },
                name: childClass.className,
              }),
            ),
          ),
        );
      }
    }

    const symbolInjectable = plugin.referenceSymbol({
      category: 'external',
      resource: '@angular/core.Injectable',
    });
    const symbolClass = plugin.registerSymbol({
      exported: true,
      meta: {
        category: 'utility',
        resource: 'class',
        resourceId: currentClass.className,
        tool: 'angular',
      },
      name: buildName({
        config: {
          case: 'preserve',
          name: plugin.config.httpRequests.classNameBuilder,
        },
        name: currentClass.className,
      }),
    });
    const node = $.class(symbolClass.placeholder)
      .export(symbolClass.exported)
      .$if(currentClass.root, (c) =>
        c.decorator(
          symbolInjectable.placeholder,
          $.object().prop('providedIn', $.literal('root')),
        ),
      )
      .do(...currentClass.nodes);
    plugin.setSymbolValue(symbolClass, node);

    generatedClasses.add(currentClass.className);
  };

  for (const requestClass of requestClasses.values()) {
    generateClass(requestClass);
  }
};

const generateAngularFunctionRequests = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  plugin.forEach(
    'operation',
    ({ operation }) => {
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });

      const symbol = plugin.registerSymbol({
        exported: true,
        meta: {
          category: 'utility',
          resource: 'operation',
          resourceId: operation.id,
          role: 'data',
          tool: 'angular',
        },
        name: plugin.config.httpRequests.methodNameBuilder(operation),
      });
      const node = generateAngularRequestFunction({
        isRequiredOptions,
        operation,
        plugin,
        symbol,
      });
      plugin.setSymbolValue(symbol, node);
    },
    {
      order: 'declarations',
    },
  );
};

const generateRequestCallExpression = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const symbolClient = plugin.getSymbol({
    category: 'client',
  });

  const optionsClient = $('options')
    .attr('client')
    .optional()
    .$if(symbolClient, (c, s) => c.coalesce(s.placeholder));

  return optionsClient
    .attr('requestOptions')
    .call(
      $.object()
        .prop('responseStyle', $.literal('data'))
        .prop('method', $.literal(operation.method.toUpperCase()))
        .prop('url', $.literal(operation.path))
        .spread('options'),
    );
};

const generateAngularRequestMethod = ({
  isRequiredOptions,
  methodName,
  operation,
  plugin,
}: {
  isRequiredOptions: boolean;
  methodName: string;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const symbolHttpRequest = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/common/http.HttpRequest',
  });

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });
  const dataType = symbolDataType?.placeholder || 'unknown';

  return $.method(methodName)
    .public()
    .$if(createOperationComment({ operation }), (c, v) =>
      c.doc(v as ReadonlyArray<string>),
    )
    .param('options', (p) =>
      p
        .optional(!isRequiredOptions)
        .type(`${symbolOptions.placeholder}<${dataType}, ThrowOnError>`),
    )
    .generic('ThrowOnError', (g) => g.extends('boolean').default(false))
    .returns(`${symbolHttpRequest.placeholder}<unknown>`)
    .do(
      $.return(
        generateRequestCallExpression({
          operation,
          plugin,
        }),
      ),
    );
};

const generateAngularRequestFunction = ({
  isRequiredOptions,
  operation,
  plugin,
  symbol,
}: {
  isRequiredOptions: boolean;
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
  symbol: Symbol;
}) => {
  const symbolHttpRequest = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/common/http.HttpRequest',
  });

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });
  const dataType = symbolDataType?.placeholder || 'unknown';

  return $.const(symbol.placeholder)
    .export(symbol.exported)
    .$if(createOperationComment({ operation }), (c, v) =>
      c.doc(v as ReadonlyArray<string>),
    )
    .assign(
      $.func()
        .param('options', (p) =>
          p
            .optional(!isRequiredOptions)
            .type(`${symbolOptions.placeholder}<${dataType}, ThrowOnError>`),
        )
        .generic('ThrowOnError', (g) => g.extends('boolean').default(false))
        .returns(`${symbolHttpRequest.placeholder}<unknown>`)
        .do(
          $.return(
            generateRequestCallExpression({
              operation,
              plugin,
            }),
          ),
        ),
    );
};

export const createHttpRequests: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  if (plugin.config.httpRequests.asClass) {
    generateAngularClassRequests({ plugin });
  } else {
    generateAngularFunctionRequests({ plugin });
  }
};
