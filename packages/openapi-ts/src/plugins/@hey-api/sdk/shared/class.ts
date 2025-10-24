import type ts from 'typescript';

import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';
import { stringCase } from '~/utils/stringCase';

import type { HeyApiSdkPlugin } from '../types';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import {
  operationClasses,
  operationParameters,
  operationStatements,
} from './operation';

type SdkClassEntry = {
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
};

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

  const symbolClient = plugin.referenceSymbol(plugin.api.selector('Client'));
  const client = getClientPlugin(plugin.context.config);
  const symClient =
    client.api && 'selector' in client.api
      ? plugin.getSymbol(
          // @ts-expect-error
          client.api.selector('client'),
        )
      : undefined;

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

export const generateClassSdk = ({
  plugin,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
}): void => {
  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const sdkClasses = new Map<number, SdkClassEntry>();
  /**
   * Track unique added classes.
   */
  const generatedClasses = new Set<number>();

  const clientClassNodes = plugin.config.instance
    ? createClientClassNodes({ plugin })
    : [];

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });
      const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
      const symbolResponse = isNuxtClient
        ? plugin.getSymbol(
            pluginTypeScript.api.selector('response', operation.id),
          )
        : undefined;

      const classes = operationClasses({
        context: plugin.context,
        operation,
        plugin,
      });

      for (const entry of classes.values()) {
        entry.path.forEach((currentClassName, index) => {
          const symbolCurrentClass = plugin.referenceSymbol(
            plugin.api.selector('class', currentClassName),
          );
          if (!sdkClasses.has(symbolCurrentClass.id)) {
            sdkClasses.set(symbolCurrentClass.id, {
              className: currentClassName,
              classes: new Set(),
              id: symbolCurrentClass.id,
              methods: new Set(),
              nodes: [],
              root: !index,
            });
          }

          const parentClassName = entry.path[index - 1];
          if (parentClassName) {
            const symbolParentClass = plugin.referenceSymbol(
              plugin.api.selector('class', parentClassName),
            );
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
                    extends: tsc.typeNode(
                      plugin.referenceSymbol(plugin.api.selector('Composable'))
                        .placeholder,
                    ),
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
    },
    {
      order: 'declarations',
    },
  );

  const symbolHeyApiClient = plugin.registerSymbol({
    exported: false,
    meta: {
      path: [],
    },
    name: '_HeyApiClient',
  });

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
                    text: plugin.referenceSymbol(childClass.id).placeholder,
                  }),
                })
              : tsc.identifier({
                  text: plugin.referenceSymbol(childClass.id).placeholder,
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

    const symbol = plugin.registerSymbol({
      exported: true,
      meta: {
        path: [],
      },
      name: currentClass.className,
      selector: plugin.api.selector('class', currentClass.className),
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
              name: plugin.referenceSymbol(plugin.api.selector('Injectable'))
                .placeholder,
            }
          : undefined,
      exportClass: symbol.exported,
      extendedClasses: plugin.config.instance
        ? [symbolHeyApiClient.placeholder]
        : undefined,
      name: symbol.placeholder,
      nodes: currentClass.nodes,
    });
    plugin.setSymbolValue(symbol, node);
    generatedClasses.add(symbol.id);
  };

  if (clientClassNodes.length) {
    const node = tsc.classDeclaration({
      exportClass: symbolHeyApiClient.exported,
      name: symbolHeyApiClient.placeholder,
      nodes: clientClassNodes,
    });
    plugin.setSymbolValue(symbolHeyApiClient, node);
  }

  for (const sdkClass of sdkClasses.values()) {
    generateClass(sdkClass);
  }
};
