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
   * Class names for child classes located inside this class.
   */
  classes: Set<string>;
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

  const symbolClient = plugin.referenceSymbol({
    category: 'external',
    resource: 'client.Client',
  });
  const symClient = plugin.getSymbol({
    category: 'client',
  });

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
  const sdkClasses = new Map<string, SdkClassEntry>();
  /**
   * Track unique added classes.
   */
  const generatedClasses = new Set<string>();

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
      const symbolResponse = isNuxtClient
        ? plugin.querySymbol({
            category: 'type',
            resource: 'operation',
            resourceId: operation.id,
            role: 'response',
          })
        : undefined;

      const classes = operationClasses({
        context: plugin.context,
        operation,
        plugin,
      });

      for (const entry of classes.values()) {
        entry.path.forEach((currentClassName, index) => {
          const symbolCurrentClass = plugin.referenceSymbol({
            category: 'utility',
            resource: 'class',
            resourceId: currentClassName,
            tool: 'sdk',
          });
          if (!sdkClasses.has(symbolCurrentClass.meta!.resourceId!)) {
            sdkClasses.set(symbolCurrentClass.meta!.resourceId!, {
              className: symbolCurrentClass.meta!.resourceId!,
              classes: new Set(),
              id: symbolCurrentClass.id,
              methods: new Set(),
              nodes: [],
              root: !index,
            });
          }

          const parentClassName = entry.path[index - 1];
          if (parentClassName) {
            const symbolParentClass = plugin.referenceSymbol({
              category: 'utility',
              resource: 'class',
              resourceId: parentClassName,
              tool: 'sdk',
            });
            if (
              symbolParentClass.meta?.resourceId !==
              symbolCurrentClass.meta?.resourceId
            ) {
              const parentClass = sdkClasses.get(
                symbolParentClass.meta!.resourceId!,
              )!;
              parentClass.classes.add(symbolCurrentClass.meta!.resourceId!);
              sdkClasses.set(symbolParentClass.meta!.resourceId!, parentClass);
            }
          }

          const isLast = entry.path.length === index + 1;
          // add methods only to the last class
          if (!isLast) {
            return;
          }

          const currentClass = sdkClasses.get(
            symbolCurrentClass.meta!.resourceId!,
          )!;

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
                      plugin.referenceSymbol({
                        category: 'external',
                        resource: 'client.Composable',
                      }).placeholder,
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

          sdkClasses.set(symbolCurrentClass.meta!.resourceId!, currentClass);
        });
      }
    },
    {
      order: 'declarations',
    },
  );

  const symbolHeyApiClient = plugin.registerSymbol({
    exported: false,
    kind: 'class',
    meta: {
      category: 'utility',
      resource: 'class',
      resourceId: '_HeyApiClient',
      tool: 'sdk',
    },
    name: '_HeyApiClient',
  });

  const generateClass = (currentClass: SdkClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    const resourceId = currentClass.className;
    generatedClasses.add(resourceId);

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = sdkClasses.get(childClassName)!;
        generateClass(childClass);

        const refChildClass = plugin.referenceSymbol({
          category: 'utility',
          resource: 'class',
          resourceId: childClass.className,
          tool: 'sdk',
        });

        const originalMemberName = stringCase({
          case: 'camelCase',
          value: refChildClass.meta!.resourceId!,
        });
        // avoid collisions with existing method names
        let memberName = originalMemberName;
        if (currentClass.methods.has(memberName)) {
          let index = 2;
          let attempt = `${memberName}${index}`;
          while (currentClass.methods.has(attempt)) {
            attempt = `${memberName}${index++}`;
          }
          memberName = attempt;
        }
        currentClass.methods.add(memberName);

        let subClassReferenceNode:
          | ts.GetAccessorDeclaration
          | ts.PropertyDeclaration;
        if (plugin.isSymbolRegistered(refChildClass.id)) {
          subClassReferenceNode = tsc.propertyDeclaration({
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
                    text: refChildClass.placeholder,
                  }),
                })
              : tsc.identifier({ text: refChildClass.placeholder }),
            modifier: plugin.config.instance ? undefined : 'static',
            name: memberName,
          });
        } else {
          subClassReferenceNode = tsc.getAccessorDeclaration({
            modifiers: plugin.config.instance
              ? undefined
              : ['public', 'static'],
            name: memberName,
            statements: plugin.config.instance
              ? [
                  tsc.returnStatement({
                    expression: tsc.newExpression({
                      argumentsArray: [
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
                      ],
                      expression: tsc.identifier({
                        text: refChildClass.placeholder,
                      }),
                    }),
                  }),
                ]
              : [
                  tsc.returnStatement({
                    expression: tsc.identifier({
                      text: refChildClass.placeholder,
                    }),
                  }),
                ],
          });
        }

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(subClassReferenceNode);
        } else {
          currentClass.nodes.push(
            // @ts-expect-error
            tsc.identifier({ text: '\n' }),
            subClassReferenceNode,
          );
        }
      }
    }

    const symbol = plugin.registerSymbol({
      exported: true,
      kind: 'class',
      meta: {
        category: 'utility',
        resource: 'class',
        resourceId,
        tool: 'sdk',
      },
      name: resourceId,
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
              name: plugin.referenceSymbol({
                category: 'external',
                resource: '@angular/core.Injectable',
              }).placeholder,
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
