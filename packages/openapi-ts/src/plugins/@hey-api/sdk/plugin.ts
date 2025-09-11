import type { ICodegenSymbolOut } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { clientModulePath } from '../../../generate/client';
import { TypeScriptRenderer } from '../../../generate/renderer';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { getClientPlugin } from '../client-core/utils';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
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

  const f = plugin.gen.ensureFile(plugin.output);

  const symbolClient = f.ensureSymbol({
    selector: plugin.api.getSelector('Client'),
  });
  const client = getClientPlugin(plugin.context.config);
  let symClient: ICodegenSymbolOut | undefined;
  if (client.api && 'getSelector' in client.api) {
    symClient = plugin.gen.selectSymbolFirst(
      // @ts-expect-error
      client.api.getSelector('client'),
    );
  }

  return [
    tsc.propertyDeclaration({
      initializer: symClient
        ? tsc.identifier({ text: symClient.placeholder })
        : undefined,
      modifier: 'protected',
      name: '_client',
      type: tsc.typeReferenceNode({ typeName: symbolClient.placeholder }),
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
                type: symbolClient.placeholder,
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
   * Symbol IDs for child classes located inside this class.
   */
  classes: Set<number>;
  /**
   * Symbol ID for the class.
   */
  id: number;
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
  const f = plugin.gen.ensureFile(plugin.output);
  const sdkClasses = new Map<number, SdkClassEntry>();
  /**
   * Track unique added classes.
   */
  const generatedClasses = new Set<number>();

  const clientClassNodes = plugin.config.instance
    ? createClientClassNodes({ plugin })
    : [];

  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });
    const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
    let symbolResponse: ICodegenSymbolOut | undefined;
    if (isNuxtClient) {
      symbolResponse = plugin.gen.selectSymbolFirst(
        pluginTypeScript.api.getSelector('response', operation.id),
      );
      if (symbolResponse) {
        f.addImport({
          from: symbolResponse.file,
          typeNames: [symbolResponse.placeholder],
        });
      }
    }

    const classes = operationClasses({
      context: plugin.context,
      operation,
      plugin,
    });

    for (const entry of classes.values()) {
      entry.path.forEach((currentClassName, index) => {
        const symbolCurrentClass = f.ensureSymbol({
          name: currentClassName,
          selector: plugin.api.getSelector('class', currentClassName),
        });
        if (!sdkClasses.has(symbolCurrentClass.id)) {
          sdkClasses.set(symbolCurrentClass.id, {
            className: symbolCurrentClass.name,
            classes: new Set(),
            id: symbolCurrentClass.id,
            methods: new Set(),
            nodes: [],
            root: !index,
          });
        }

        const parentClassName = entry.path[index - 1];
        if (parentClassName) {
          const symbolParentClass = f.ensureSymbol({
            name: parentClassName,
            selector: plugin.api.getSelector('class', parentClassName),
          });
          if (
            symbolParentClass.placeholder !== symbolCurrentClass.placeholder
          ) {
            const parentClass = sdkClasses.get(symbolParentClass.id)!;
            parentClass.classes.add(symbolCurrentClass.id);
            sdkClasses.set(symbolParentClass.id, parentClass);
          }
        }

        const isLast = entry.path.length === index + 1;
        // add methods only to the last class
        if (!isLast) {
          return;
        }

        const currentClass = sdkClasses.get(symbolCurrentClass.id)!;

        // avoid duplicate methods
        if (currentClass.methods.has(entry.methodName)) {
          return;
        }

        const opParameters = operationParameters({
          file: f,
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
                  default: tsc.ots.string('$fetch'),
                  extends: tsc.typeNode('Composable'),
                  name: nuxtTypeComposable,
                },
                {
                  default: symbolResponse
                    ? tsc.typeReferenceNode({
                        typeName: symbolResponse.placeholder,
                      })
                    : tsc.typeNode('undefined'),
                  extends: symbolResponse
                    ? tsc.typeReferenceNode({
                        typeName: symbolResponse.placeholder,
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

        sdkClasses.set(symbolCurrentClass.id, currentClass);
      });
    }
  });

  const symbolHeyApiClient = f.addSymbol({ name: '_HeyApiClient' });

  const generateClass = (currentClass: SdkClassEntry) => {
    if (generatedClasses.has(currentClass.id)) {
      return;
    }

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = sdkClasses.get(childClassName)!;
        generateClass(childClass);

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
                    text: f.getSymbolById(childClass.id)!.placeholder,
                  }),
                })
              : tsc.identifier({
                  text: f.getSymbolById(childClass.id)!.placeholder,
                }),
            modifier: plugin.config.instance ? undefined : 'static',
            name: stringCase({
              case: 'camelCase',
              value: childClass.className,
            }),
          }),
        );
      }
    }

    const symbol = f.ensureSymbol({
      name: currentClass.className,
      selector: plugin.api.getSelector('class', currentClass.className),
    });
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
      extendedClasses: plugin.config.instance
        ? [symbolHeyApiClient.placeholder]
        : undefined,
      name: symbol.placeholder,
      nodes: currentClass.nodes,
    });
    symbol.update({ value: node });
    generatedClasses.add(symbol.id);
  };

  if (clientClassNodes.length) {
    const node = tsc.classDeclaration({
      exportClass: false,
      name: symbolHeyApiClient.placeholder,
      nodes: clientClassNodes,
    });
    symbolHeyApiClient.update({ value: node });
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
  const f = plugin.gen.ensureFile(plugin.output);

  plugin.forEach('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context: plugin.context,
      operation,
    });
    const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
    let symbolResponse: ICodegenSymbolOut | undefined;
    if (isNuxtClient) {
      symbolResponse = plugin.gen.selectSymbolFirst(
        pluginTypeScript.api.getSelector('response', operation.id),
      );
      if (symbolResponse) {
        f.addImport({
          from: symbolResponse.file,
          typeNames: [symbolResponse.placeholder],
        });
      }
    }
    const opParameters = operationParameters({
      file: f,
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
    const symbol = f.addSymbol({
      name: serviceFunctionIdentifier({
        config: plugin.context.config,
        handleIllegal: true,
        id: operation.id,
        operation,
      }),
      selector: plugin.api.getSelector('function', operation.id),
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
                default: tsc.ots.string('$fetch'),
                extends: tsc.typeNode('Composable'),
                name: nuxtTypeComposable,
              },
              {
                default: symbolResponse
                  ? tsc.typeReferenceNode({
                      typeName: symbolResponse.placeholder,
                    })
                  : tsc.typeNode('undefined'),
                extends: symbolResponse
                  ? tsc.typeReferenceNode({
                      typeName: symbolResponse.placeholder,
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
      name: symbol.placeholder,
    });
    symbol.update({ value: node });
  });
};

export const handler: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const f = plugin.gen.createFile(plugin.output, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  // import required packages and core files
  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: f.path,
  });
  const symbolClientOptions = f.addSymbol({ name: 'ClientOptions' });
  f.addImport({
    aliases: {
      Options: symbolClientOptions.placeholder,
    },
    from: clientModule,
    typeNames: ['Options'],
  });

  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  if (isNuxtClient) {
    f.addImport({ from: clientModule, typeNames: ['Composable'] });
  }

  if (isAngularClient && plugin.config.asClass) {
    f.addImport({ from: '@angular/core', names: ['Injectable'] });
  }

  createTypeOptions({ plugin, symbolClientOptions });

  if (plugin.config.asClass) {
    generateClassSdk({ plugin });
  } else {
    generateFlatSdk({ plugin });
  }

  if (plugin.config.exportFromIndex && f.hasContent()) {
    const index = plugin.gen.ensureFile('index');
    index.addExport({ from: f, namespaceImport: true });
  }
};
