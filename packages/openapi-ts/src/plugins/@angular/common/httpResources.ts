import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { operationClasses } from '~/plugins/@hey-api/sdk/shared/operation';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';
import { stringCase } from '~/utils/stringCase';

import type { AngularCommonPlugin } from './types';

interface AngularServiceClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ts.ClassElement>;
  root: boolean;
}

const generateAngularClassServices = ({
  plugin,
}: {
  plugin: AngularCommonPlugin['Instance'];
}) => {
  const serviceClasses = new Map<string, AngularServiceClassEntry>();
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

          const methodNode = generateAngularResourceMethod({
            isRequiredOptions,
            methodName: resourceMethodName,
            operation,
            plugin,
          });

          if (!currentClass.nodes.length) {
            currentClass.nodes.push(methodNode);
          } else {
            // @ts-expect-error
            currentClass.nodes.push(tsc.identifier({ text: '\n' }), methodNode);
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
          tsc.propertyDeclaration({
            initializer: tsc.newExpression({
              argumentsArray: [],
              expression: tsc.identifier({
                text: buildName({
                  config: {
                    case: 'preserve',
                    name: plugin.config.httpResources.classNameBuilder,
                  },
                  name: childClass.className,
                }),
              }),
            }),
            name: stringCase({
              case: 'camelCase',
              value: childClass.className,
            }),
          }),
        );
      }
    }

    const symbolInjectable = plugin.referenceSymbol({
      category: 'external',
      resource: '@angular/core.Injectable',
    });
    const symbolClass = plugin.registerSymbol({
      exported: true,
      name: buildName({
        config: {
          case: 'preserve',
          name: plugin.config.httpResources.classNameBuilder,
        },
        name: currentClass.className,
      }),
    });
    const node = tsc.classDeclaration({
      decorator: currentClass.root
        ? {
            args: [{ providedIn: 'root' }],
            name: symbolInjectable.placeholder,
          }
        : undefined,
      exportClass: symbolClass.exported,
      name: symbolClass.placeholder,
      nodes: currentClass.nodes,
    });
    plugin.setSymbolValue(symbolClass, node);

    generatedClasses.add(currentClass.className);
  };

  for (const serviceClass of serviceClasses.values()) {
    generateClass(serviceClass);
  }
};

const generateAngularFunctionServices = ({
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
        name: plugin.config.httpResources.methodNameBuilder(operation),
      });
      const node = generateAngularResourceFunction({
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

  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'response',
  });
  const responseType = symbolResponseType?.placeholder || 'unknown';

  if (plugin.config.httpRequests.asClass) {
    // For class-based request methods, use inject and class hierarchy
    const classes = operationClasses({
      context: plugin.context,
      operation,
      plugin: sdkPlugin,
    });

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
      const symbolInject = plugin.referenceSymbol({
        category: 'external',
        resource: '@angular/core.inject',
      });
      let methodAccess: ts.Expression = tsc.callExpression({
        functionName: symbolInject.placeholder,
        parameters: [tsc.identifier({ text: symbolClass.placeholder })],
      });

      // Navigate through the class hierarchy
      for (let i = 1; i < firstEntry.path.length; i++) {
        const className = firstEntry.path[i];
        if (className) {
          methodAccess = tsc.propertyAccessExpression({
            expression: methodAccess,
            name: stringCase({
              case: 'camelCase',
              value: className,
            }),
          });
        }
      }

      methodAccess = tsc.propertyAccessExpression({
        expression: methodAccess,
        name: plugin.config.httpRequests.methodNameBuilder(operation),
      });

      return tsc.callExpression({
        functionName: symbolHttpResource.placeholder,
        parameters: [
          tsc.arrowFunction({
            parameters: [],
            statements: [
              tsc.constVariable({
                expression: tsc.conditionalExpression({
                  condition: tsc.identifier({ text: 'options' }),
                  whenFalse: tsc.identifier({ text: 'undefined' }),
                  whenTrue: tsc.callExpression({
                    functionName: 'options',
                    parameters: [],
                  }),
                }),
                name: 'opts',
              }),
              tsc.returnStatement({
                expression: tsc.conditionalExpression({
                  condition: tsc.identifier({ text: 'opts' }),
                  whenFalse: tsc.identifier({ text: 'undefined' }),
                  whenTrue: tsc.callExpression({
                    functionName: methodAccess,
                    parameters: [tsc.identifier({ text: 'opts' })],
                  }),
                }),
              }),
            ],
          }),
        ],
        types: [tsc.typeNode(responseType)],
      });
    }
  } else {
    const symbolHttpRequest = plugin.referenceSymbol({
      category: 'utility',
      resource: 'operation',
      resourceId: operation.id,
      role: 'data',
      tool: 'angular',
    });

    return tsc.callExpression({
      functionName: symbolHttpResource.placeholder,
      parameters: [
        tsc.arrowFunction({
          parameters: [],
          statements: [
            tsc.constVariable({
              expression: tsc.conditionalExpression({
                condition: tsc.identifier({ text: 'options' }),
                whenFalse: tsc.identifier({ text: 'undefined' }),
                whenTrue: tsc.callExpression({
                  functionName: 'options',
                  parameters: [],
                }),
              }),
              name: 'opts',
            }),
            tsc.returnStatement({
              expression: tsc.conditionalExpression({
                condition: tsc.identifier({ text: 'opts' }),
                whenFalse: tsc.identifier({ text: 'undefined' }),
                whenTrue: tsc.callExpression({
                  functionName: symbolHttpRequest.placeholder,
                  parameters: [tsc.identifier({ text: 'opts' })],
                }),
              }),
            }),
          ],
        }),
      ],
      types: [tsc.typeNode(responseType)],
    });
  }

  // Fallback return (should not reach here)
  return tsc.callExpression({
    functionName: symbolHttpResource.placeholder,
    parameters: [
      tsc.arrowFunction({
        parameters: [],
        statements: [
          tsc.returnStatement({
            expression: tsc.identifier({ text: 'undefined' }),
          }),
        ],
      }),
    ],
    types: [tsc.typeNode(responseType)],
  });
};

const generateAngularResourceMethod = ({
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
  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.selector('Options'),
  );

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });
  const dataType = symbolDataType?.placeholder || 'unknown';

  return tsc.methodDeclaration({
    accessLevel: 'public',
    comment: createOperationComment({ operation }),
    name: methodName,
    parameters: [
      {
        isRequired: isRequiredOptions,
        name: 'options',
        type: `() => ${symbolOptions.placeholder}<${dataType}, ThrowOnError> | undefined`,
      },
    ],
    returnType: undefined,
    statements: [
      tsc.returnStatement({
        expression: generateResourceCallExpression({
          operation,
          plugin,
        }),
      }),
    ],
    types: [
      {
        default: false,
        extends: 'boolean',
        name: 'ThrowOnError',
      },
    ],
  });
};

const generateAngularResourceFunction = ({
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
  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.selector('Options'),
  );

  const symbolDataType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });
  const dataType = symbolDataType?.placeholder || 'unknown';

  return tsc.constVariable({
    comment: createOperationComment({ operation }),
    exportConst: symbol.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: `() => ${symbolOptions.placeholder}<${dataType}, ThrowOnError> | undefined`,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: generateResourceCallExpression({
            operation,
            plugin,
          }),
        }),
      ],
      types: [
        {
          default: false,
          extends: 'boolean',
          name: 'ThrowOnError',
        },
      ],
    }),
    name: symbol.placeholder,
  });
};

export const createHttpResources: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  if (plugin.config.httpResources.asClass) {
    generateAngularClassServices({ plugin });
  } else {
    generateAngularFunctionServices({ plugin });
  }
};
