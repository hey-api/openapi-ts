import ts from 'typescript';

import { clientApi, clientModulePath } from '../../../generate/client';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { getClientPlugin } from '../client-core/utils';
import { typesId } from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault, sdkId } from './constants';
import {
  operationClasses,
  operationParameters,
  operationStatements,
} from './operation';
import { serviceFunctionIdentifier } from './plugin-legacy';
import { createTypeOptions } from './typeOptions';
import type { HeyApiSdkPlugin } from './types';

const createClientClassNodes = ({
  plugin,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
}): ReadonlyArray<ts.ClassElement> => {
  const clientAssignmentStatement = tsc.expressionToStatement({
    expression: tsc.binaryExpression({
      left: tsc.propertyAccessExpression({
        expression: tsc.this(),
        name: '_client',
      }),
      operator: '=',
      right: tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'args' }),
        name: 'client',
      }),
    }),
  });

  return [
    tsc.propertyDeclaration({
      initializer: plugin.config.client
        ? tsc.identifier({ text: '_heyApiClient' })
        : undefined,
      modifier: 'protected',
      name: '_client',
      type: ts.factory.createTypeReferenceNode('Client'),
    }),
    // @ts-expect-error
    tsc.identifier({ text: '\n' }),
    tsc.constructorDeclaration({
      multiLine: true,
      parameters: [
        {
          isRequired: !plugin.config.client,
          name: 'args',
          type: tsc.typeInterfaceNode({
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
          : tsc.ifStatement({
              expression: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'args' }),
                isOptional: true,
                name: 'client',
              }),
              thenStatement: tsc.block({
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
  classes: Set<{ className: string; propertyName: string }>;
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
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
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
    const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
    const fileTypeScript = plugin.context.file({ id: typesId })!;
    const responseImport = file.import({
      asType: true,
      module: file.relativePathToFile({ context: plugin.context, id: typesId }),
      name: isNuxtClient
        ? fileTypeScript.getName(
            pluginTypeScript.api.getId({ operation, type: 'response' }),
          )
        : undefined,
    });

    const classes = operationClasses({
      context: plugin.context,
      operation,
      plugin,
    });

    for (const entry of classes.values()) {
      entry.path.forEach((currentClassName, index) => {
        if (!sdkClasses.has(currentClassName.className)) {
          sdkClasses.set(currentClassName.className, {
            className: currentClassName.className,
            classes: new Set(),
            methods: new Set(),
            nodes: [],
            root: !index,
          });
        }

        const parentClassName = entry.path[index - 1];
        if (parentClassName && parentClassName !== currentClassName) {
          const parentClass = sdkClasses.get(parentClassName.className)!;
          parentClass.classes.add({
            className: currentClassName.className,
            propertyName: currentClassName.propertyName,
          });
          sdkClasses.set(parentClassName.className, parentClass);
        }

        const isLast = entry.path.length === index + 1;
        // add methods only to the last class
        if (!isLast) {
          return;
        }

        const currentClass = sdkClasses.get(currentClassName.className)!;

        // avoid duplicate methods
        if (currentClass.methods.has(entry.methodName)) {
          return;
        }

        const opParameters = operationParameters({
          file,
          isRequiredOptions,
          operation,
          plugin,
        });
        const statements = operationStatements({
          isRequiredOptions,
          opParameters,
          operation,
          plugin,
        });
        const functionNode = tsc.methodDeclaration({
          accessLevel: 'public',
          comment: createOperationComment({ operation }),
          isStatic: isAngularClient ? false : !plugin.config.instance,
          name: entry.methodName,
          parameters: opParameters.parameters,
          returnType: undefined,
          statements,
          types: isNuxtClient
            ? [
                {
                  // default: tsc.ots.string('$fetch'),
                  extends: tsc.typeNode('Composable'),
                  name: nuxtTypeComposable,
                },
                {
                  default: responseImport.name
                    ? tsc.typeReferenceNode({
                        typeName: responseImport.name,
                      })
                    : tsc.typeNode('undefined'),
                  extends: responseImport.name
                    ? tsc.typeReferenceNode({
                        typeName: responseImport.name,
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
            tsc.identifier({ text: '\n' }),
            functionNode,
          );
        }

        currentClass.methods.add(entry.methodName);

        sdkClasses.set(currentClassName.className, currentClass);
      });
    }
  });

  const generateClass = (currentClass: SdkClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = sdkClasses.get(childClassName.className)!;
        generateClass(childClass);

        // Skip if the property already exists
        /** @ts-ignore */
        if (
          currentClass.nodes.find(
            (node) => node.name?.escapedText === childClassName.propertyName,
          )
        ) {
          continue;
        }

        currentClass.nodes.push(
          tsc.propertyDeclaration({
            initializer: plugin.config.instance
              ? tsc.newExpression({
                  argumentsArray: plugin.config.instance
                    ? [
                        tsc.objectExpression({
                          multiLine: false,
                          obj: [
                            {
                              key: 'client',
                              value: tsc.propertyAccessExpression({
                                expression: tsc.this(),
                                name: '_client',
                              }),
                            },
                          ],
                        }),
                      ]
                    : [],
                  expression: tsc.identifier({
                    text: childClass.className,
                  }),
                })
              : tsc.identifier({ text: childClass.className }),
            modifier: plugin.config.instance ? undefined : 'static',
            name: stringCase({
              case: 'camelCase',
              value: childClassName.propertyName,
            }),
          }),
        );
      }
    }

    const node = tsc.classDeclaration({
      decorator:
        currentClass.root && isAngularClient
          ? {
              args: [
                {
                  providedIn: 'root',
                },
              ],
              name: 'Injectable',
            }
          : undefined,
      exportClass: currentClass.root,
      extendedClasses: plugin.config.instance ? ['_HeyApiClient'] : undefined,
      name: currentClass.className,
      nodes: currentClass.nodes,
    });
    file.add(node);
    generatedClasses.add(currentClass.className);
  };

  if (clientClassNodes.length) {
    const node = tsc.classDeclaration({
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
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = plugin.context.file({ id: sdkId })!;

  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });
    const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
    const fileTypeScript = plugin.context.file({ id: typesId })!;
    const responseImport = file.import({
      asType: true,
      module: file.relativePathToFile({ context: plugin.context, id: typesId }),
      name: isNuxtClient
        ? fileTypeScript.getName(
            pluginTypeScript.api.getId({ operation, type: 'response' }),
          )
        : undefined,
    });
    const opParameters = operationParameters({
      file,
      isRequiredOptions,
      operation,
      plugin,
    });
    const statements = operationStatements({
      isRequiredOptions,
      opParameters,
      operation,
      plugin,
    });
    const node = tsc.constVariable({
      comment: createOperationComment({ operation }),
      exportConst: true,
      expression: tsc.arrowFunction({
        parameters: opParameters.parameters,
        returnType: undefined,
        statements,
        types: isNuxtClient
          ? [
              {
                // default: tsc.ots.string('$fetch'),
                extends: tsc.typeNode('Composable'),
                name: nuxtTypeComposable,
              },
              {
                default: responseImport.name
                  ? tsc.typeReferenceNode({
                      typeName: responseImport.name,
                    })
                  : tsc.typeNode('undefined'),
                extends: responseImport.name
                  ? tsc.typeReferenceNode({
                      typeName: responseImport.name,
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

export const handler: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
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
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  if (isNuxtClient) {
    file.import({
      asType: true,
      module: clientModule,
      name: 'Composable',
    });
  }

  if (isAngularClient && plugin.config.asClass) {
    file.import({
      module: '@angular/core',
      name: 'Injectable',
    });
  }

  createTypeOptions({ clientOptions, plugin });

  if (plugin.config.asClass) {
    generateClassSdk({ plugin });
  } else {
    generateFlatSdk({ plugin });
  }
};
