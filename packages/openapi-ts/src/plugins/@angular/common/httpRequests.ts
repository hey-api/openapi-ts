import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { operationClasses } from '~/plugins/@hey-api/sdk/operation';
import { isOperationOptionsRequired } from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';
import { stringCase } from '~/utils/stringCase';

import type { AngularCommonPlugin } from './types';

interface AngularRequestClassEntry {
  className: string;
  classes: Set<string>;
  methods: Set<string>;
  nodes: Array<ts.ClassElement>;
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
            // @ts-expect-error
            currentClass.nodes.push(tsc.identifier({ text: '\n' }), methodNode);
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
          tsc.propertyDeclaration({
            initializer: tsc.newExpression({
              argumentsArray: [],
              expression: tsc.identifier({
                text: buildName({
                  config: {
                    case: 'preserve',
                    name: plugin.config.httpRequests.classNameBuilder,
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

    const symbolInjectable = plugin.referenceSymbol(
      plugin.api.selector('Injectable'),
    );
    const symbolClass = plugin.registerSymbol({
      exported: true,
      name: buildName({
        config: {
          case: 'preserve',
          name: plugin.config.httpRequests.classNameBuilder,
        },
        name: currentClass.className,
      }),
      selector: plugin.api.selector('class', currentClass.className),
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
        name: plugin.config.httpRequests.methodNameBuilder(operation),
        selector: plugin.api.selector('httpRequest', operation.id),
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
  const client = getClientPlugin(plugin.context.config);
  const symbolClient =
    client.api && 'selector' in client.api
      ? plugin.getSymbol(
          // @ts-expect-error
          client.api.selector('client'),
        )
      : undefined;

  const optionsClient = tsc.propertyAccessExpression({
    expression: tsc.identifier({ text: 'options' }),
    isOptional: true,
    name: 'client',
  });

  let clientExpression: ts.Expression;
  if (symbolClient) {
    clientExpression = tsc.binaryExpression({
      left: optionsClient,
      operator: '??',
      right: symbolClient.placeholder,
    });
  } else {
    clientExpression = optionsClient;
  }

  return tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: clientExpression,
      name: 'requestOptions',
    }),
    parameters: [
      tsc.objectExpression({
        obj: [
          {
            key: 'responseStyle',
            value: tsc.identifier({ text: "'data'" }),
          },
          {
            key: 'method',
            value: tsc.identifier({
              text: `'${operation.method.toUpperCase()}'`,
            }),
          },
          {
            key: 'url',
            value: tsc.identifier({ text: `'${operation.path}'` }),
          },
          {
            spread: 'options',
          },
        ],
      }),
    ],
  });
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
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolHttpRequest = plugin.referenceSymbol(
    plugin.api.selector('HttpRequest'),
  );

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.selector('Options'),
  );

  const symbolDataType = plugin.getSymbol(
    pluginTypeScript.api.selector('data', operation.id),
  );
  const dataType = symbolDataType?.placeholder || 'unknown';

  return tsc.methodDeclaration({
    accessLevel: 'public',
    comment: sdkPlugin.api.createOperationComment({ operation }),
    name: methodName,
    parameters: [
      {
        isRequired: isRequiredOptions,
        name: 'options',
        type: `${symbolOptions.placeholder}<${dataType}, ThrowOnError>`,
      },
    ],
    returnType: `${symbolHttpRequest.placeholder}<unknown>`,
    statements: [
      tsc.returnStatement({
        expression: generateRequestCallExpression({
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
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolHttpRequest = plugin.referenceSymbol(
    plugin.api.selector('HttpRequest'),
  );

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.selector('Options'),
  );

  const symbolDataType = plugin.getSymbol(
    pluginTypeScript.api.selector('data', operation.id),
  );
  const dataType = symbolDataType?.placeholder || 'unknown';

  return tsc.constVariable({
    comment: sdkPlugin.api.createOperationComment({ operation }),
    exportConst: symbol.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: `${symbolOptions.placeholder}<${dataType}, ThrowOnError>`,
        },
      ],
      returnType: `${symbolHttpRequest.placeholder}<unknown>`,
      statements: [
        tsc.returnStatement({
          expression: generateRequestCallExpression({
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

export const createHttpRequests: AngularCommonPlugin['Handler'] = ({
  plugin,
}) => {
  if (plugin.config.httpRequests.asClass) {
    generateAngularClassRequests({ plugin });
  } else {
    generateAngularFunctionRequests({ plugin });
  }
};
