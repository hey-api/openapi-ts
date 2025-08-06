import { clientApi } from '../../../generate/client';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { type Property, tsc } from '../../../tsc';
import { getClientBaseUrlKey } from '../../@hey-api/client-core/utils';
import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const createQueryKeyFn = 'createQueryKey';
export const queryKeyName = 'QueryKey';
const TOptionsType = 'TOptions';

const infiniteIdentifier = tsc.identifier({ text: 'infinite' });
const optionsIdentifier = tsc.identifier({ text: 'options' });

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
    const returnType = tsc.indexedAccessTypeNode({
      indexType: tsc.literalTypeNode({
        literal: tsc.ots.number(0),
      }),
      objectType: tsc.typeReferenceNode({
        typeArguments: [tsc.typeReferenceNode({ typeName: TOptionsType })],
        typeName: queryKeyName,
      }),
    });

    const baseUrlKey = getClientBaseUrlKey(plugin.context.config);

    const fn = tsc.constVariable({
      expression: tsc.arrowFunction({
        multiLine: true,
        parameters: [
          {
            name: 'id',
            type: tsc.typeReferenceNode({ typeName: 'string' }),
          },
          {
            isRequired: false,
            name: 'options',
            type: tsc.typeReferenceNode({ typeName: TOptionsType }),
          },
          {
            isRequired: false,
            name: 'infinite',
            type: tsc.typeReferenceNode({ typeName: 'boolean' }),
          },
          {
            isRequired: false,
            name: 'tags',
            type: tsc.typeReferenceNode({ typeName: 'ReadonlyArray<string>' }),
          },
        ],
        returnType: tsc.typeTupleNode({
          types: [returnType],
        }),
        statements: [
          tsc.constVariable({
            assertion: returnType,
            expression: tsc.objectExpression({
              multiLine: false,
              obj: [
                {
                  key: '_id',
                  value: tsc.identifier({ text: 'id' }),
                },
                {
                  key: baseUrlKey,
                  value: tsc.identifier({
                    text: `options?.${baseUrlKey} || (options?.client ?? _heyApiClient).getConfig().${baseUrlKey}`,
                  }),
                },
              ],
            }),
            name: 'params',
            typeName: returnType,
          }),
          tsc.ifStatement({
            expression: infiniteIdentifier,
            thenStatement: tsc.block({
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.binaryExpression({
                    left: tsc.propertyAccessExpression({
                      expression: 'params',
                      name: '_infinite',
                    }),
                    right: infiniteIdentifier,
                  }),
                }),
              ],
            }),
          }),
          tsc.ifStatement({
            expression: tsc.identifier({ text: 'tags' }),
            thenStatement: tsc.block({
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.binaryExpression({
                    left: tsc.propertyAccessExpression({
                      expression: 'params',
                      name: 'tags',
                    }),
                    right: tsc.identifier({ text: 'tags' }),
                  }),
                }),
              ],
            }),
          }),
          tsc.ifStatement({
            expression: tsc.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: tsc.identifier({ text: 'body' }),
            }),
            thenStatement: tsc.block({
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.binaryExpression({
                    left: tsc.propertyAccessExpression({
                      expression: 'params',
                      name: 'body',
                    }),
                    right: tsc.propertyAccessExpression({
                      expression: 'options',
                      name: 'body',
                    }),
                  }),
                }),
              ],
            }),
          }),
          tsc.ifStatement({
            expression: tsc.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: tsc.identifier({ text: 'headers' }),
            }),
            thenStatement: tsc.block({
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.binaryExpression({
                    left: tsc.propertyAccessExpression({
                      expression: 'params',
                      name: 'headers',
                    }),
                    right: tsc.propertyAccessExpression({
                      expression: 'options',
                      name: 'headers',
                    }),
                  }),
                }),
              ],
            }),
          }),
          tsc.ifStatement({
            expression: tsc.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: tsc.identifier({ text: 'path' }),
            }),
            thenStatement: tsc.block({
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.binaryExpression({
                    left: tsc.propertyAccessExpression({
                      expression: 'params',
                      name: 'path',
                    }),
                    right: tsc.propertyAccessExpression({
                      expression: 'options',
                      name: 'path',
                    }),
                  }),
                }),
              ],
            }),
          }),
          tsc.ifStatement({
            expression: tsc.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: tsc.identifier({ text: 'query' }),
            }),
            thenStatement: tsc.block({
              statements: [
                tsc.expressionToStatement({
                  expression: tsc.binaryExpression({
                    left: tsc.propertyAccessExpression({
                      expression: 'params',
                      name: 'query',
                    }),
                    right: tsc.propertyAccessExpression({
                      expression: 'options',
                      name: 'query',
                    }),
                  }),
                }),
              ],
            }),
          }),
          tsc.returnStatement({
            expression: tsc.arrayLiteralExpression({
              elements: [tsc.identifier({ text: 'params' })],
            }),
          }),
        ],
        types: [
          {
            extends: tsc.typeReferenceNode({
              typeName: tsc.identifier({
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
  operation,
  plugin,
}: {
  id: string;
  isInfinite?: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const identifierCreateQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-create-query-key/${createQueryKeyFn}`,
    case: plugin.config.case,
    namespace: 'value',
  });

  const tagsExpression =
    operation.tags && operation.tags.length > 0
      ? tsc.arrayLiteralExpression({
          elements: operation.tags.map((tag) =>
            tsc.stringLiteral({ text: tag }),
          ),
        })
      : undefined;

  const createQueryKeyCallExpression = tsc.callExpression({
    functionName: identifierCreateQueryKey.name || '',
    parameters: [
      tsc.ots.string(id),
      'options',
      tsc.ots.boolean(!!isInfinite),
      tagsExpression,
    ],
  });
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({ plugin }: { plugin: PluginInstance }) => {
  const file = plugin.context.file({ id: plugin.name })!;

  const properties: Array<Property> = [
    {
      name: '_id',
      type: tsc.keywordTypeNode({
        keyword: 'string',
      }),
    },
    {
      isRequired: false,
      name: '_infinite',
      type: tsc.keywordTypeNode({
        keyword: 'boolean',
      }),
    },
    {
      isRequired: false,
      name: 'tags',
      type: tsc.typeReferenceNode({
        typeName: 'ReadonlyArray<string>',
      }),
    },
  ];

  const queryKeyType = tsc.typeAliasDeclaration({
    exportType: true,
    name: queryKeyName,
    type: tsc.typeTupleNode({
      types: [
        tsc.typeIntersectionNode({
          types: [
            tsc.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, '${getClientBaseUrlKey(plugin.context.config)}' | 'body' | 'headers' | 'path' | 'query'>`,
            }),
            tsc.typeInterfaceNode({
              properties,
              useLegacyResolution: true,
            }),
          ],
        }),
      ],
    }),
    typeParameters: [
      {
        extends: tsc.typeReferenceNode({
          typeName: tsc.identifier({
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
  const identifier = isInfinite
    ? file.identifier({
        // TODO: refactor for better cross-plugin compatibility
        $ref: `#/tanstack-query-infinite-query-key/${operation.id}`,
        case: plugin.config.infiniteQueryKeys.case,
        create: true,
        nameTransformer: plugin.config.infiniteQueryKeys.name,
        namespace: 'value',
      })
    : file.identifier({
        // TODO: refactor for better cross-plugin compatibility
        $ref: `#/tanstack-query-query-key/${operation.id}`,
        case: plugin.config.queryKeys.case,
        create: true,
        nameTransformer: plugin.config.queryKeys.name,
        namespace: 'value',
      });
  const statement = tsc.constVariable({
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: hasOperationDataRequired(operation),
          name: 'options',
          type: typeData,
        },
      ],
      returnType: isInfinite ? typeQueryKey : undefined,
      statements: createQueryKeyLiteral({
        id: operation.id,
        isInfinite,
        operation,
        plugin,
      }),
    }),
    name: identifier.name || '',
  });
  return statement;
};
