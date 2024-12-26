import { compiler, type Property } from '../../../compiler';
import { clientApi } from '../../../generate/client';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { getClientBaseUrlKey } from './client';
import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const createQueryKeyFn = 'createQueryKey';
export const queryKeyName = 'QueryKey';
const TOptionsType = 'TOptions';

export const createQueryKeyFunction = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const returnType = compiler.indexedAccessTypeNode({
    indexType: compiler.literalTypeNode({
      literal: compiler.ots.number(0),
    }),
    objectType: compiler.typeReferenceNode({
      typeArguments: [compiler.typeReferenceNode({ typeName: TOptionsType })],
      typeName: queryKeyName,
    }),
  });

  const infiniteIdentifier = compiler.identifier({ text: 'infinite' });

  const identifierCreateQueryKey = file.identifier({
    $ref: `#/ir/${createQueryKeyFn}`,
    create: true,
    namespace: 'value',
  });

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
      returnType,
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
                key: getClientBaseUrlKey(),
                value: compiler.identifier({
                  text: `(options?.client ?? client).getConfig().${getClientBaseUrlKey()}`,
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
            expression: compiler.identifier({ text: 'options' }),
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
            expression: compiler.identifier({ text: 'options' }),
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
            expression: compiler.identifier({ text: 'options' }),
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
            expression: compiler.identifier({ text: 'options' }),
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
        compiler.returnVariable({
          expression: 'params',
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
    name: identifierCreateQueryKey.name || '',
  });
  file.add(fn);
};

const createQueryKeyLiteral = ({
  context,
  id,
  isInfinite,
  plugin,
}: {
  context: IR.Context;
  id: string;
  isInfinite?: boolean;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;
  const identifierCreateQueryKey = file.identifier({
    $ref: `#/ir/${createQueryKeyFn}`,
    namespace: 'value',
  });
  const queryKeyLiteral = compiler.arrayLiteralExpression({
    elements: [
      compiler.callExpression({
        functionName: identifierCreateQueryKey.name || '',
        parameters: [
          compiler.ots.string(id),
          'options',
          isInfinite ? compiler.ots.boolean(true) : undefined,
        ],
      }),
    ],
    multiLine: false,
  });
  return queryKeyLiteral;
};

export const createQueryKeyType = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const properties: Property[] = [
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
    name: queryKeyName,
    type: compiler.typeTupleNode({
      types: [
        compiler.typeIntersectionNode({
          types: [
            compiler.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, '${getClientBaseUrlKey()}' | 'body' | 'headers' | 'path' | 'query'>`,
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

export const queryKeyFunctionIdentifier = ({
  context,
  isInfinite,
  operation,
}: {
  context: IR.Context;
  isInfinite?: boolean;
  operation: IR.OperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}${isInfinite ? 'Infinite' : ''}QueryKey`;

export const queryKeyStatement = ({
  context,
  isInfinite,
  operation,
  plugin,
  typeQueryKey,
}: {
  context: IR.Context;
  isInfinite: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  typeQueryKey?: string;
}) => {
  const file = context.file({ id: plugin.name })!;
  const typeData = useTypeData({ context, operation, plugin });
  const name = queryKeyFunctionIdentifier({
    context,
    isInfinite,
    operation,
  });
  const identifierQueryKey = file.identifier({
    $ref: `#/queryKey/${name}`,
    create: true,
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
        context,
        id: operation.id,
        isInfinite,
        plugin,
      }),
    }),
    name: identifierQueryKey.name || '',
  });
  return statement;
};
