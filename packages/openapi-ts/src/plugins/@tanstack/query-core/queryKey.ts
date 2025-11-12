import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { getClientBaseUrlKey } from '~/plugins/@hey-api/client-core/utils';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { type Property, tsc } from '~/tsc';

import { useTypeData } from './shared/useType';
import type { PluginInstance } from './types';

const TOptionsType = 'TOptions';

const infiniteIdentifier = tsc.identifier({ text: 'infinite' });
const optionsIdentifier = tsc.identifier({ text: 'options' });

export const createQueryKeyFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const symbolCreateQueryKey = plugin.registerSymbol({
    meta: {
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'createQueryKey',
    }),
  });
  const symbolQueryKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'QueryKey',
    tool: plugin.name,
  });

  const returnType = tsc.indexedAccessTypeNode({
    indexType: tsc.literalTypeNode({
      literal: tsc.ots.number(0),
    }),
    objectType: tsc.typeReferenceNode({
      typeArguments: [tsc.typeReferenceNode({ typeName: TOptionsType })],
      typeName: symbolQueryKeyType.placeholder,
    }),
  });

  const baseUrlKey = getClientBaseUrlKey(plugin.context.config);

  const symbolClient = plugin.getSymbol({
    category: 'client',
  });

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });

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
                  text: `options?.${baseUrlKey} || (options?.client ?? ${symbolClient?.placeholder}).getConfig().${baseUrlKey}`,
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
            typeName: tsc.identifier({ text: symbolOptions.placeholder }),
          }),
          name: TOptionsType,
        },
      ],
    }),
    name: symbolCreateQueryKey.placeholder,
  });
  plugin.setSymbolValue(symbolCreateQueryKey, fn);
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
  const config = isInfinite
    ? plugin.config.infiniteQueryKeys
    : plugin.config.queryKeys;
  let tagsArray: TsDsl<ts.ArrayLiteralExpression> | undefined;
  if (config.tags && operation.tags && operation.tags.length > 0) {
    tagsArray = $.array().items(...operation.tags);
  }
  const symbolCreateQueryKey = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createQueryKey',
    tool: plugin.name,
  });
  const createQueryKeyCallExpression = $(symbolCreateQueryKey.placeholder).call(
    $.literal(id),
    'options',
    isInfinite || tagsArray ? $.literal(Boolean(isInfinite)) : undefined,
    tagsArray,
  );
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({ plugin }: { plugin: PluginInstance }) => {
  const properties: Array<Property> = [
    {
      name: '_id',
      type: tsc.keywordTypeNode({ keyword: 'string' }),
    },
    {
      isRequired: false,
      name: '_infinite',
      type: tsc.keywordTypeNode({ keyword: 'boolean' }),
    },
    {
      isRequired: false,
      name: 'tags',
      type: tsc.typeReferenceNode({ typeName: 'ReadonlyArray<string>' }),
    },
  ];

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolQueryKeyType = plugin.registerSymbol({
    exported: true,
    kind: 'type',
    meta: {
      category: 'type',
      resource: 'QueryKey',
      tool: plugin.name,
    },
    name: 'QueryKey',
  });
  const queryKeyType = tsc.typeAliasDeclaration({
    exportType: symbolQueryKeyType.exported,
    name: symbolQueryKeyType.placeholder,
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
          typeName: tsc.identifier({ text: symbolOptions.placeholder }),
        }),
        name: TOptionsType,
      },
    ],
  });
  plugin.setSymbolValue(symbolQueryKeyType, queryKeyType);
};

export const queryKeyStatement = ({
  isInfinite,
  operation,
  plugin,
  symbol,
  typeQueryKey,
}: {
  isInfinite: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  symbol: Symbol;
  typeQueryKey?: string;
}) => {
  const typeData = useTypeData({ operation, plugin });
  const statement = $.const(symbol.placeholder)
    .export(symbol.exported)
    .assign(
      $.func()
        .param('options', (p) =>
          p.optional(!hasOperationDataRequired(operation)).type(typeData),
        )
        .$if(isInfinite && typeQueryKey, (f, v) => f.returns(v))
        .do(
          createQueryKeyLiteral({
            id: operation.id,
            isInfinite,
            operation,
            plugin,
          }).return(),
        ),
    );
  return statement;
};
