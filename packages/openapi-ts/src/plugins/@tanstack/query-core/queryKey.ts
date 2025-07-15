import { compiler, type Property } from '../../../compiler';
import { clientApi } from '../../../generate/client';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { getClientBaseUrlKey } from '../../@hey-api/client-core/utils';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const createQueryKeyFn = 'createQueryKey';
export const queryKeyName = 'QueryKey';
const TOptionsType = 'TOptions';

const infiniteIdentifier = compiler.identifier({ text: 'infinite' });
const optionsIdentifier = compiler.identifier({ text: 'options' });

export const createQueryKeyFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;

  const identifierCreateQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-create-query-key/${createQueryKeyFn}`,
    case: plugin.config.case,
    create: true,
    namespace: 'value',
  });

  if (identifierCreateQueryKey.name) {
    const returnType = compiler.indexedAccessTypeNode({
      indexType: compiler.literalTypeNode({
        literal: compiler.ots.number(0),
      }),
      objectType: compiler.typeReferenceNode({
        typeArguments: [compiler.typeReferenceNode({ typeName: TOptionsType })],
        typeName: queryKeyName,
      }),
    });

    const baseUrlKey = getClientBaseUrlKey(plugin.context.config);

    const fn = compiler.constVariable({
      expression: compiler.arrowFunction({
        multiLine: true,
        parameters: [
          {
            name: 'id',
            type: compiler.typeReferenceNode({ typeName: 'string' }),
          },
          {
            isRequired: false,
            name: 'options',
            type: compiler.typeReferenceNode({ typeName: TOptionsType }),
          },
          {
            isRequired: false,
            name: 'infinite',
            type: compiler.typeReferenceNode({ typeName: 'boolean' }),
          },
        ],
        returnType: compiler.typeTupleNode({
          types: [returnType],
        }),
        statements: [
          compiler.constVariable({
            assertion: returnType,
            expression: compiler.objectExpression({
              multiLine: false,
              obj: [
                {
                  key: '_id',
                  value: compiler.identifier({ text: 'id' }),
                },
                {
                  key: baseUrlKey,
                  value: compiler.identifier({
                    text: `options?.${baseUrlKey} || (options?.client ?? _heyApiClient).getConfig().${baseUrlKey}`,
                  }),
                },
              ],
            }),
            name: 'params',
            typeName: returnType,
          }),
          compiler.ifStatement({
            expression: infiniteIdentifier,
            thenStatement: compiler.block({
              statements: [
                compiler.expressionToStatement({
                  expression: compiler.binaryExpression({
                    left: compiler.propertyAccessExpression({
                      expression: 'params',
                      name: '_infinite',
                    }),
                    right: infiniteIdentifier,
                  }),
                }),
              ],
            }),
          }),
          compiler.ifStatement({
            expression: compiler.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: compiler.identifier({ text: 'body' }),
            }),
            thenStatement: compiler.block({
              statements: [
                compiler.expressionToStatement({
                  expression: compiler.binaryExpression({
                    left: compiler.propertyAccessExpression({
                      expression: 'params',
                      name: 'body',
                    }),
                    right: compiler.propertyAccessExpression({
                      expression: 'options',
                      name: 'body',
                    }),
                  }),
                }),
              ],
            }),
          }),
          compiler.ifStatement({
            expression: compiler.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: compiler.identifier({ text: 'headers' }),
            }),
            thenStatement: compiler.block({
              statements: [
                compiler.expressionToStatement({
                  expression: compiler.binaryExpression({
                    left: compiler.propertyAccessExpression({
                      expression: 'params',
                      name: 'headers',
                    }),
                    right: compiler.propertyAccessExpression({
                      expression: 'options',
                      name: 'headers',
                    }),
                  }),
                }),
              ],
            }),
          }),
          compiler.ifStatement({
            expression: compiler.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: compiler.identifier({ text: 'path' }),
            }),
            thenStatement: compiler.block({
              statements: [
                compiler.expressionToStatement({
                  expression: compiler.binaryExpression({
                    left: compiler.propertyAccessExpression({
                      expression: 'params',
                      name: 'path',
                    }),
                    right: compiler.propertyAccessExpression({
                      expression: 'options',
                      name: 'path',
                    }),
                  }),
                }),
              ],
            }),
          }),
          compiler.ifStatement({
            expression: compiler.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: compiler.identifier({ text: 'query' }),
            }),
            thenStatement: compiler.block({
              statements: [
                compiler.expressionToStatement({
                  expression: compiler.binaryExpression({
                    left: compiler.propertyAccessExpression({
                      expression: 'params',
                      name: 'query',
                    }),
                    right: compiler.propertyAccessExpression({
                      expression: 'options',
                      name: 'query',
                    }),
                  }),
                }),
              ],
            }),
          }),
          compiler.returnStatement({
            expression: compiler.arrayLiteralExpression({
              elements: [compiler.identifier({ text: 'params' })],
            }),
          }),
        ],
        types: [
          {
            extends: compiler.typeReferenceNode({
              typeName: compiler.identifier({
                text: clientApi.Options.name,
              }),
            }),
            name: TOptionsType,
          },
        ],
      }),
      name: identifierCreateQueryKey.name,
    });
    file.add(fn);
  }
};

const createQueryKeyLiteral = ({
  id,
  isInfinite,
  plugin,
}: {
  id: string;
  isInfinite?: boolean;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const identifierCreateQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-create-query-key/${createQueryKeyFn}`,
    case: plugin.config.case,
    namespace: 'value',
  });
  const createQueryKeyCallExpression = compiler.callExpression({
    functionName: identifierCreateQueryKey.name || '',
    parameters: [
      compiler.ots.string(id),
      'options',
      isInfinite ? compiler.ots.boolean(true) : undefined,
    ],
  });
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({ plugin }: { plugin: PluginInstance }) => {
  const file = plugin.context.file({ id: plugin.name })!;

  const properties: Array<Property> = [
    {
      name: '_id',
      type: compiler.keywordTypeNode({
        keyword: 'string',
      }),
    },
    {
      isRequired: false,
      name: '_infinite',
      type: compiler.keywordTypeNode({
        keyword: 'boolean',
      }),
    },
  ];

  const queryKeyType = compiler.typeAliasDeclaration({
    exportType: true,
    name: queryKeyName,
    type: compiler.typeTupleNode({
      types: [
        compiler.typeIntersectionNode({
          types: [
            compiler.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, '${getClientBaseUrlKey(plugin.context.config)}' | 'body' | 'headers' | 'path' | 'query'>`,
            }),
            compiler.typeInterfaceNode({
              properties,
              useLegacyResolution: true,
            }),
          ],
        }),
      ],
    }),
    typeParameters: [
      {
        extends: compiler.typeReferenceNode({
          typeName: compiler.identifier({
            text: clientApi.Options.name,
          }),
        }),
        name: TOptionsType,
      },
    ],
  });
  file.add(queryKeyType);
};

export const queryKeyStatement = ({
  isInfinite,
  operation,
  plugin,
  typeQueryKey,
}: {
  isInfinite: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  typeQueryKey?: string;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const typeData = useTypeData({ operation, plugin });

  const functionIdentifier = serviceFunctionIdentifier({
    config: plugin.context.config,
    id: operation.id,
    operation,
  });

  const identifier = isInfinite
    ? file.identifier({
        // TODO: refactor for better cross-plugin compatibility
        $ref: `#/tanstack-query-infinite-query-key/${functionIdentifier}`,
        case: plugin.config.infiniteQueryKeys.case,
        create: true,
        nameTransformer: plugin.config.infiniteQueryKeys.name,
        namespace: 'value',
      })
    : file.identifier({
        // TODO: refactor for better cross-plugin compatibility
        $ref: `#/tanstack-query-query-key/${functionIdentifier}`,
        case: plugin.config.queryKeys.case,
        create: true,
        nameTransformer: plugin.config.queryKeys.name,
        namespace: 'value',
      });
  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.arrowFunction({
      parameters: [
        {
          isRequired: hasOperationDataRequired(operation),
          name: 'options',
          type: typeData,
        },
      ],
      returnType: isInfinite ? typeQueryKey : undefined,
      statements: createQueryKeyLiteral({
        id: functionIdentifier,
        isInfinite,
        plugin,
      }),
    }),
    name: identifier.name || '',
  });
  return statement;
};
