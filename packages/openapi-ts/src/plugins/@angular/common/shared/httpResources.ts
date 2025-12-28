import type { IR } from '~/ir/types';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { applyNaming, toCase } from '~/utils/naming';

import type { AngularCommonPlugin } from '../types';

interface AngularServiceClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ReturnType<typeof $.method | typeof $.field | typeof $.newline>>;
  root: boolean;
}

const generateClassServices = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const serviceClasses = new Map<string, AngularServiceClassEntry>();
  const generatedClasses = new Set<string>();

  const symbolInjectable = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/core.Injectable',
  });
  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
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
          if (!serviceClasses.has(currentClassName)) {
            serviceClasses.set(currentClassName, {
              className: currentClassName,
              classes: new Set(),
              methods: new Set(),
              nodes: [],
              root: !index,
            });
          }

          const parentClassName = entry.path[index - 1];
          if (parentClassName && parentClassName !== currentClassName) {
            const parentClass = serviceClasses.get(parentClassName)!;
            parentClass.classes.add(currentClassName);
            serviceClasses.set(parentClassName, parentClass);
          }

          const isLast = entry.path.length === index + 1;
          if (!isLast) {
            return;
          }

          const currentClass = serviceClasses.get(currentClassName)!;

          const resourceMethodName =
            plugin.config.httpResources.methodNameBuilder(operation);

          if (currentClass.methods.has(resourceMethodName)) {
            return;
          }

          const symbolDataType = plugin.querySymbol({
            category: 'type',
            resource: 'operation',
            resourceId: operation.id,
            role: 'data',
            tool: 'typescript',
          });

          const methodNode = $.method(resourceMethodName)
            .public()
            .$if(createOperationComment(operation), (c, v) => c.doc(v))
            .param('options', (p) =>
              p.required(isRequiredOptions).type(
                $.type.func().returns(
                  $.type.or(
                    $.type(symbolOptions)
                      .generic(symbolDataType ?? 'unknown')
                      .generic('ThrowOnError'),
                    $.type('undefined'),
                  ),
                ),
              ),
            )
            .generic('ThrowOnError', (g) => g.extends('boolean').default(false))
            .do(
              $.return(
                generateResourceCallExpression({
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

          currentClass.methods.add(resourceMethodName);
          serviceClasses.set(currentClassName, currentClass);
        });
      }
    },
    {
      order: 'declarations',
    },
  );

  const generateClass = (currentClass: AngularServiceClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = serviceClasses.get(childClassName)!;
        generateClass(childClass);

        currentClass.nodes.push(
          $.field(toCase(childClass.className, 'camelCase')).assign(
            $.new(
              applyNaming(childClass.className, {
                case: 'preserve',
                name: plugin.config.httpResources.classNameBuilder,
              }),
            ),
          ),
        );
      }
    }

    const symbolClass = plugin.symbol(
      applyNaming(currentClass.className, {
        case: 'preserve',
        name: plugin.config.httpResources.classNameBuilder,
      }),
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

  for (const serviceClass of serviceClasses.values()) {
    generateClass(serviceClass);
  }
};

const generateFunctionServices = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
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
        plugin.config.httpResources.methodNameBuilder(operation),
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
                $.type.func().returns(
                  $.type.or(
                    $.type(symbolOptions)
                      .generic(symbolDataType ?? 'unknown')
                      .generic('ThrowOnError'),
                    $.type('undefined'),
                  ),
                ),
              ),
            )
            .generic('ThrowOnError', (g) => g.extends('boolean').default(false))
            .do(
              $.return(
                generateResourceCallExpression({
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

const generateResourceCallExpression = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  const symbolHttpResource = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/common/http.httpResource',
  });
  const symbolInject = plugin.referenceSymbol({
    category: 'external',
    resource: '@angular/core.inject',
  });

  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'response',
  });

  if (plugin.config.httpRequests.asClass) {
    // For class-based request methods, use inject and class hierarchy
    const classes = operationClasses({ operation, plugin: sdkPlugin });

    const firstEntry = Array.from(classes.values())[0];
    if (firstEntry) {
      // Import the root class from HTTP requests
      const rootClassName = firstEntry.path[0]!;
      const symbolClass = plugin.referenceSymbol({
        category: 'utility',
        resource: 'class',
        resourceId: rootClassName,
        tool: 'angular',
      });

      // Build the method access path using inject
      let methodAccess: ReturnType<typeof $.attr | typeof $.call> =
        $(symbolInject).call(symbolClass);

      // Navigate through the class hierarchy
      for (let i = 1; i < firstEntry.path.length; i++) {
        const className = firstEntry.path[i];
        if (className) {
          methodAccess = methodAccess.attr(toCase(className, 'camelCase'));
        }
      }

      methodAccess = methodAccess.attr(
        plugin.config.httpRequests.methodNameBuilder(operation),
      );

      return $(symbolHttpResource)
        .call(
          $.func().do(
            $.const('opts').assign(
              $.ternary('options')
                .do($('options').call())
                .otherwise($.id('undefined')),
            ),
            $.return(
              $.ternary('opts')
                .do(methodAccess.call('opts'))
                .otherwise($.id('undefined')),
            ),
          ),
        )
        .generic(symbolResponseType ?? 'unknown');
    }
  } else {
    const symbolHttpRequest = plugin.referenceSymbol({
      category: 'utility',
      resource: 'operation',
      resourceId: operation.id,
      role: 'data',
      tool: 'angular',
    });

    return $(symbolHttpResource)
      .call(
        $.func().do(
          $.const('opts').assign(
            $.ternary('options')
              .do($('options').call())
              .otherwise($.id('undefined')),
          ),
          $.return(
            $.ternary('opts')
              .do($(symbolHttpRequest).call('opts'))
              .otherwise($.id('undefined')),
          ),
        ),
      )
      .generic(symbolResponseType ?? 'unknown');
  }

  // Fallback return (should not reach here)
  return $(symbolHttpResource).call(
    $.func()
      .do($.return($.id('undefined')))
      .generic(symbolResponseType ?? 'unknown'),
  );
};

export const createHttpResources: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  if (plugin.config.httpResources.asClass) {
    generateClassServices({ plugin });
  } else {
    generateFunctionServices({ plugin });
  }
};
