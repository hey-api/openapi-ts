import ts from 'typescript';

import { compiler } from '../../../compiler';
import { clientApi, clientModulePath } from '../../../generate/client';
import type { IR } from '../../../ir/types';
import { stringCase } from '../../../utils/stringCase';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { Plugin } from '../../types';
import { getClientPlugin } from '../client-core/utils';
import { importIdentifier } from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault, sdkId } from './constants';
import {
  operationClasses,
  operationOptionsType,
  operationStatements,
} from './operation';
import { serviceFunctionIdentifier } from './plugin-legacy';
import { createTypeOptions } from './typeOptions';
import type { Config } from './types';

const createClientClassNodes = ({
  plugin,
}: {
  plugin: Plugin.Instance<Config>;
}): ReadonlyArray<ts.ClassElement> => {
  const clientAssignmentStatement = compiler.expressionToStatement({
    expression: compiler.binaryExpression({
      left: compiler.propertyAccessExpression({
        expression: compiler.this(),
        name: '_client',
      }),
      operator: '=',
      right: compiler.propertyAccessExpression({
        expression: compiler.identifier({ text: 'args' }),
        name: 'client',
      }),
    }),
  });

  return [
    compiler.propertyDeclaration({
      initializer: plugin.client
        ? compiler.identifier({ text: '_heyApiClient' })
        : undefined,
      modifier: 'protected',
      name: '_client',
      type: ts.factory.createTypeReferenceNode('Client'),
    }),
    // @ts-expect-error
    compiler.identifier({ text: '\n' }),
    compiler.constructorDeclaration({
      multiLine: true,
      parameters: [
        {
          isRequired: !plugin.client,
          name: 'args',
          type: compiler.typeInterfaceNode({
            properties: [
              {
                isRequired: !plugin.client,
                name: 'client',
                type: 'Client',
              },
            ],
            useLegacyResolution: false,
          }),
        },
      ],
      statements: [
        !plugin.client
          ? clientAssignmentStatement
          : compiler.ifStatement({
              expression: compiler.propertyAccessExpression({
                expression: compiler.identifier({ text: 'args' }),
                isOptional: true,
                name: 'client',
              }),
              thenStatement: compiler.block({
                statements: [clientAssignmentStatement],
              }),
            }),
      ],
    }),
  ];
};

interface SdkClassEntry {
  /**
   * Name of the class.
   */
  className: string;
  /**
   * List of class nodes containing methods.
   */
  nodes: Array<ts.ClassElement>;
  /**
   * JSONPath-like array to class location.
   */
  path: ReadonlyArray<string>;
}

const generateClassSdk = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = context.file({ id: sdkId })!;
  const sdkClasses = new Map<string, SdkClassEntry>();

  const clientClassNodes = plugin.instance
    ? createClientClassNodes({ plugin })
    : [];

  context.subscribe('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context,
      operation,
    });
    const identifierResponse = importIdentifier({
      context,
      file,
      operation,
      type: 'response',
    });

    const classes = operationClasses({ context, operation, plugin });
    for (const entry of classes.values()) {
      if (!sdkClasses.has(entry.className)) {
        sdkClasses.set(entry.className, {
          className: entry.className,
          nodes: [],
          path: entry.path,
        });
      }

      const sdkClass = sdkClasses.get(entry.className)!;

      const functionNode = compiler.methodDeclaration({
        accessLevel: 'public',
        comment: createOperationComment({ operation }),
        isStatic: !plugin.instance,
        name: entry.methodName,
        parameters: [
          {
            isRequired: isRequiredOptions,
            name: 'options',
            type: operationOptionsType({
              context,
              file,
              operation,
              throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: operationStatements({
          context,
          isRequiredOptions,
          operation,
          plugin,
        }),
        types: isNuxtClient
          ? [
              {
                // default: compiler.ots.string('$fetch'),
                extends: compiler.typeNode('Composable'),
                name: nuxtTypeComposable,
              },
              {
                default: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : compiler.typeNode('undefined'),
                extends: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : undefined,
                name: nuxtTypeDefault,
              },
            ]
          : [
              {
                default:
                  ('throwOnError' in client ? client.throwOnError : false) ??
                  false,
                extends: 'boolean',
                name: 'ThrowOnError',
              },
            ],
      });

      if (!sdkClass.nodes.length) {
        sdkClass.nodes.push(functionNode);
      } else {
        sdkClass.nodes.push(
          // @ts-expect-error
          compiler.identifier({ text: '\n' }),
          functionNode,
        );
      }

      sdkClasses.set(entry.className, sdkClass);
    }
  });

  context.subscribe('after', () => {
    if (clientClassNodes.length) {
      const node = compiler.classDeclaration({
        exportClass: false,
        name: '_HeyApiClient',
        nodes: clientClassNodes,
      });
      file.add(node);
    }

    for (const sdkClass of sdkClasses.values()) {
      const parentClassName = sdkClass.path[sdkClass.path.length - 2];
      if (parentClassName) {
        // this should happen only for root
        if (!sdkClasses.has(parentClassName)) {
          sdkClasses.set(parentClassName, {
            className: parentClassName,
            nodes: [],
            path: [],
          });
        }

        const parentClass = sdkClasses.get(parentClassName)!;

        parentClass.nodes.push(
          compiler.propertyDeclaration({
            initializer: compiler.newExpression({
              argumentsArray: [
                compiler.objectExpression({
                  multiLine: false,
                  obj: [
                    {
                      key: 'client',
                      value: compiler.propertyAccessExpression({
                        expression: compiler.this(),
                        name: '_client',
                      }),
                    },
                  ],
                }),
              ],
              expression: compiler.identifier({ text: sdkClass.className }),
            }),
            name: stringCase({
              case: 'camelCase',
              value: sdkClass.className,
            }),
          }),
        );
      }
    }

    for (const sdkClass of sdkClasses.values()) {
      const node = compiler.classDeclaration({
        exportClass: !sdkClass.path.length,
        extendedClasses: plugin.instance ? ['_HeyApiClient'] : undefined,
        name: sdkClass.className,
        nodes: sdkClass.nodes,
      });
      file.add(node);
    }
  });
};

const generateFlatSdk = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = context.file({ id: sdkId })!;

  context.subscribe('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context,
      operation,
    });
    const identifierResponse = importIdentifier({
      context,
      file,
      operation,
      type: 'response',
    });
    const node = compiler.constVariable({
      comment: createOperationComment({ operation }),
      exportConst: true,
      expression: compiler.arrowFunction({
        parameters: [
          {
            isRequired: isRequiredOptions,
            name: 'options',
            type: operationOptionsType({
              context,
              file,
              operation,
              throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: operationStatements({
          context,
          isRequiredOptions,
          operation,
          plugin,
        }),
        types: isNuxtClient
          ? [
              {
                // default: compiler.ots.string('$fetch'),
                extends: compiler.typeNode('Composable'),
                name: nuxtTypeComposable,
              },
              {
                default: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : compiler.typeNode('undefined'),
                extends: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : undefined,
                name: nuxtTypeDefault,
              },
            ]
          : [
              {
                default:
                  ('throwOnError' in client ? client.throwOnError : false) ??
                  false,
                extends: 'boolean',
                name: 'ThrowOnError',
              },
            ],
      }),
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: true,
        id: operation.id,
        operation,
      }),
    });
    file.add(node);
  });
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: sdkId,
    path: plugin.output,
  });

  // import required packages and core files
  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const clientOptions = file.import({
    ...clientApi.Options,
    alias: 'ClientOptions',
    module: clientModule,
  });

  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  if (isNuxtClient) {
    file.import({
      asType: true,
      module: clientModule,
      name: 'Composable',
    });
  }

  createTypeOptions({
    clientOptions,
    context,
    plugin,
  });

  if (plugin.asClass) {
    generateClassSdk({ context, plugin });
  } else {
    generateFlatSdk({ context, plugin });
  }
};
