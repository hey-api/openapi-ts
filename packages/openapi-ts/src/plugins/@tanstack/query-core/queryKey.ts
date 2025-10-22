import type { Symbol } from '@hey-api/codegen-core';
import type { Expression } from 'typescript';

import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { type Property, tsc } from '../../../tsc';
import {
  getClientBaseUrlKey,
  getClientPlugin,
} from '../../@hey-api/client-core/utils';
import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const TOptionsType = 'TOptions';

const infiniteIdentifier = tsc.identifier({ text: 'infinite' });
const optionsIdentifier = tsc.identifier({ text: 'options' });

export const createQueryKeyFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const symbolCreateQueryKey = plugin.registerSymbol({
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'createQueryKey',
    }),
    selector: plugin.api.selector('createQueryKey'),
  });
  const symbolQueryKeyType = plugin.referenceSymbol(
    plugin.api.selector('QueryKey'),
  );

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

  const client = getClientPlugin(plugin.context.config);
  const symbolClient =
    client.api && 'selector' in client.api
      ? plugin.getSymbol(
          // @ts-expect-error
          client.api.selector('client'),
        )
      : undefined;

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.selector('Options'),
  );

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
  let tagsExpression: Expression | undefined;
  if (config.tags && operation.tags && operation.tags.length > 0) {
    tagsExpression = tsc.arrayLiteralExpression({
      elements: operation.tags.map((tag) => tsc.stringLiteral({ text: tag })),
    });
  }

  const symbolCreateQueryKey = plugin.referenceSymbol(
    plugin.api.selector('createQueryKey'),
  );
  const createQueryKeyCallExpression = tsc.callExpression({
    functionName: symbolCreateQueryKey.placeholder,
    parameters: [
      tsc.ots.string(id),
      'options',
      isInfinite || tagsExpression
        ? tsc.ots.boolean(Boolean(isInfinite))
        : undefined,
      tagsExpression,
    ],
  });
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

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.selector('Options'),
  );
  const symbolQueryKeyType = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
    },
    name: 'QueryKey',
    selector: plugin.api.selector('QueryKey'),
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
  const statement = tsc.constVariable({
    exportConst: symbol.exported,
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
    name: symbol.placeholder,
  });
  return statement;
};
