import type { IR } from '~/ir/types';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { applyNaming, toCase } from '~/utils/naming';

import type { AngularCommonPlugin } from '../types';

interface AngularRequestClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ReturnType<typeof $.method | typeof $.field | typeof $.newline>>;
  root: boolean;
}

const generateClassRequests = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const requestClasses = new Map<string, AngularRequestClassEntry>();
  const generatedClasses = new Set<string>();

  const symbolHttpRequest = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/common/http.HttpRequest',
  });
  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolInjectable = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/core.Injectable',
  });

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });

      const classes = operationClasses({ operation, plugin: sdkPlugin });

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

          const symbolDataType = plugin.querySymbol({
            category: 'type',
            resource: 'operation',
            resourceId: operation.id,
            role: 'data',
            tool: 'typescript',
          });

          const methodNode = $.method(requestMethodName)
            .public()
            .$if(createOperationComment(operation), (c, v) => c.doc(v))
            .param('options', (p) =>
              p.required(isRequiredOptions).type(
                $.type(symbolOptions)
                  .generic(symbolDataType ?? 'unknown')
                  .generic('ThrowOnError'),
              ),
            )
            .generic('ThrowOnError', (g) => g.extends('boolean').default(false))
            .returns($.type(symbolHttpRequest).generic('unknown'))
            .do(
              $.return(
                generateRequestCallExpression({
                  operation,
                  plugin,
                }),
              ),
            );

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
          $.field(toCase(childClass.className, 'camelCase')).assign(
            $.new(
              applyNaming(childClass.className, {
                case: 'preserve',
                name: plugin.config.httpRequests.classNameBuilder,
              }),
            ),
          ),
        );
      }
    }

    const symbolClass = plugin.symbol(
      applyNaming(currentClass.className, {
        case: 'preserve',
        name: plugin.config.httpRequests.classNameBuilder,
      }),
      {
        meta: {
          category: 'utility',
          resource: 'class',
          resourceId: currentClass.className,
          tool: 'angular',
        },
      },
    );
    const node = $.class(symbolClass)
      .export()
      .$if(currentClass.root, (c) =>
        c.decorator(
          symbolInjectable,
          $.object().prop('providedIn', $.literal('root')),
        ),
      )
      .do(...currentClass.nodes);
    plugin.node(node);

    generatedClasses.add(currentClass.className);
  };

  for (const requestClass of requestClasses.values()) {
    generateClass(requestClass);
  }
};

const generateFunctionRequests = ({
  plugin,
}: {
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

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });

      const symbol = plugin.symbol(
        plugin.config.httpRequests.methodNameBuilder(operation),
        {
          meta: {
            category: 'utility',
            resource: 'operation',
            resourceId: operation.id,
            role: 'data',
            tool: 'angular',
          },
        },
      );

      const symbolDataType = plugin.querySymbol({
        category: 'type',
        resource: 'operation',
        resourceId: operation.id,
        role: 'data',
        tool: 'typescript',
      });

      const node = $.const(symbol)
        .export()
        .$if(createOperationComment(operation), (c, v) => c.doc(v))
        .assign(
          $.func()
            .param('options', (p) =>
              p.required(isRequiredOptions).type(
                $.type(symbolOptions)
                  .generic(symbolDataType ?? 'unknown')
                  .generic('ThrowOnError'),
              ),
            )
            .generic('ThrowOnError', (g) => g.extends('boolean').default(false))
            .returns($.type(symbolHttpRequest).generic('unknown'))
            .do(
              $.return(
                generateRequestCallExpression({
                  operation,
                  plugin,
                }),
              ),
            ),
        );
      plugin.node(node);
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
    .$if(symbolClient, (c, s) => c.coalesce(s));

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

export const createHttpRequests: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  if (plugin.config.httpRequests.asClass) {
    generateClassRequests({ plugin });
  } else {
    generateFunctionRequests({ plugin });
  }
};
