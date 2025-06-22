import ts from 'typescript';

import { compiler } from '../../../compiler';
import { clientApi, clientModulePath } from '../../../generate/client';
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
import type { HeyApiSdkPlugin } from './types';

const createClientClassNodes = ({
  plugin,
}: {
  plugin: Plugin.Instance<HeyApiSdkPlugin>;
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
      initializer: plugin.config.client
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
          isRequired: !plugin.config.client,
          name: 'args',
          type: compiler.typeInterfaceNode({
            properties: [
              {
                isRequired: !plugin.config.client,
                name: 'client',
                type: 'Client',
              },
            ],
            useLegacyResolution: false,
          }),
        },
      ],
      statements: [
        !plugin.config.client
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
   * Child classes located inside this class.
   */
  classes: Set<string>;
  /**
   * Track unique added method nodes.
   */
  methods: Set<string>;
  /**
   * List of class nodes containing methods.
   */
  nodes: Array<ts.ClassElement>;
  /**
   * Is this a root class?
   */
  root: boolean;
}

const generateClassSdk = ({
  plugin,
}: {
  plugin: Plugin.Instance<HeyApiSdkPlugin>;
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = plugin.context.file({ id: sdkId })!;
  const sdkClasses = new Map<string, SdkClassEntry>();
  /**
   * Track unique added classes.
   */
  const generatedClasses = new Set<string>();

  const clientClassNodes = plugin.config.instance
    ? createClientClassNodes({ plugin })
    : [];

  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });
    const identifierResponse = importIdentifier({
      context: plugin.context,
      file,
      operation,
      type: 'response',
    });

    const classes = operationClasses({
      context: plugin.context,
      operation,
      plugin,
    });

    for (const entry of classes.values()) {
      entry.path.forEach((currentClassName, index) => {
        if (!sdkClasses.has(currentClassName)) {
          sdkClasses.set(currentClassName, {
            className: currentClassName,
            classes: new Set(),
            methods: new Set(),
            nodes: [],
            root: !index,
          });
        }

        const parentClassName = entry.path[index - 1];
        if (parentClassName) {
          const parentClass = sdkClasses.get(parentClassName)!;
          parentClass.classes.add(currentClassName);
          sdkClasses.set(parentClassName, parentClass);
        }

        const isLast = entry.path.length === index + 1;
        // add methods only to the last class
        if (!isLast) {
          return;
        }

        const currentClass = sdkClasses.get(currentClassName)!;

        // avoid duplicate methods
        if (currentClass.methods.has(entry.methodName)) {
          return;
        }

        const functionNode = compiler.methodDeclaration({
          accessLevel: 'public',
          comment: createOperationComment({ operation }),
          isStatic: !plugin.config.instance,
          name: entry.methodName,
          parameters: [
            {
              isRequired: isRequiredOptions,
              name: 'options',
              type: operationOptionsType({
                context: plugin.context,
                file,
                operation,
                throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
              }),
            },
          ],
          returnType: undefined,
          statements: operationStatements({
            context: plugin.context,
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
                    ('throwOnError' in client.config
                      ? client.config.throwOnError
                      : false) ?? false,
                  extends: 'boolean',
                  name: 'ThrowOnError',
                },
              ],
        });

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(functionNode);
        } else {
          currentClass.nodes.push(
            // @ts-expect-error
            compiler.identifier({ text: '\n' }),
            functionNode,
          );
        }

        currentClass.methods.add(entry.methodName);

        sdkClasses.set(currentClassName, currentClass);
      });
    }
  });

  const generateClass = (currentClass: SdkClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = sdkClasses.get(childClassName)!;
        generateClass(childClass);

        currentClass.nodes.push(
          compiler.propertyDeclaration({
            initializer: plugin.config.instance
              ? compiler.newExpression({
                  argumentsArray: plugin.config.instance
                    ? [
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
                      ]
                    : [],
                  expression: compiler.identifier({
                    text: childClass.className,
                  }),
                })
              : compiler.identifier({ text: childClass.className }),
            modifier: plugin.config.instance ? undefined : 'static',
            name: stringCase({
              case: 'camelCase',
              value: childClass.className,
            }),
          }),
        );
      }
    }

    const node = compiler.classDeclaration({
      exportClass: currentClass.root,
      extendedClasses: plugin.config.instance ? ['_HeyApiClient'] : undefined,
      name: currentClass.className,
      nodes: currentClass.nodes,
    });
    file.add(node);
    generatedClasses.add(currentClass.className);
  };

  if (clientClassNodes.length) {
    const node = compiler.classDeclaration({
      exportClass: false,
      name: '_HeyApiClient',
      nodes: clientClassNodes,
    });
    file.add(node);
  }

  for (const sdkClass of sdkClasses.values()) {
    generateClass(sdkClass);
  }
};

const generateFlatSdk = ({
  plugin,
}: {
  plugin: Plugin.Instance<HeyApiSdkPlugin>;
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = plugin.context.file({ id: sdkId })!;

  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });
    const identifierResponse = importIdentifier({
      context: plugin.context,
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
              context: plugin.context,
              file,
              operation,
              throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: operationStatements({
          context: plugin.context,
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
                  ('throwOnError' in client.config
                    ? client.config.throwOnError
                    : false) ?? false,
                extends: 'boolean',
                name: 'ThrowOnError',
              },
            ],
      }),
      name: serviceFunctionIdentifier({
        config: plugin.context.config,
        handleIllegal: true,
        id: operation.id,
        operation,
      }),
    });
    file.add(node);
  });
};

export const handler: Plugin.Handler<HeyApiSdkPlugin> = ({ plugin }) => {
  const file = plugin.createFile({
    id: sdkId,
    path: plugin.output,
  });

  // import required packages and core files
  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const clientOptions = file.import({
    ...clientApi.Options,
    alias: 'ClientOptions',
    module: clientModule,
  });

  const client = getClientPlugin(plugin.context.config);
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
    context: plugin.context,
    plugin,
  });

  if (plugin.config.asClass) {
    generateClassSdk({ plugin });
  } else {
    generateFlatSdk({ plugin });
  }
};
