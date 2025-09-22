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
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './useType';
import { getPublicTypeData } from './utils';

const TOptionsType = 'TOptions';

const optionsIdentifier = tsc.identifier({ text: 'options' });

export const createQueryKeyFunction = ({
  plugin,
}: {
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const symbolCreateQueryKey = plugin.registerSymbol({
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'createQueryKey',
    }),
    selector: plugin.api.getSelector('createQueryKey'),
  });
  const symbolQueryKeyType = plugin.referenceSymbol(
    plugin.api.getSelector('QueryKey'),
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
    client.api && 'getSelector' in client.api
      ? plugin.getSymbol(
          // @ts-expect-error
          client.api.getSelector('client'),
        )
      : undefined;

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.getSelector('Options'),
  );
  const symbolJsonValue = plugin.referenceSymbol(
    plugin.api.getSelector('_JSONValue'),
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
              { key: '_id', value: tsc.identifier({ text: 'id' }) },
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
          expression: tsc.identifier({ text: 'tags' }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'tags',
                  }),
                  right: tsc.asExpression({
                    expression: tsc.asExpression({
                      expression: tsc.identifier({ text: 'tags' }),
                      type: tsc.keywordTypeNode({ keyword: 'unknown' }),
                    }),
                    type: tsc.typeReferenceNode({
                      typeName: symbolJsonValue.placeholder,
                    }),
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
                  right: tsc.asExpression({
                    expression: tsc.asExpression({
                      expression: tsc.propertyAccessExpression({
                        expression: 'options',
                        name: 'query',
                      }),
                      type: tsc.keywordTypeNode({ keyword: 'unknown' }),
                    }),
                    type: tsc.typeReferenceNode({
                      typeName: symbolJsonValue.placeholder,
                    }),
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
  operation,
  plugin,
}: {
  id: string;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const config = plugin.config.queryKeys;
  let tagsExpression: Expression | undefined;
  if (config.tags && operation.tags && operation.tags.length > 0) {
    tagsExpression = tsc.arrayLiteralExpression({
      elements: operation.tags.map((tag) => tsc.stringLiteral({ text: tag })),
    });
  }

  const symbolCreateQueryKey = plugin.referenceSymbol(
    plugin.api.getSelector('createQueryKey'),
  );
  const createQueryKeyCallExpression = tsc.callExpression({
    functionName: symbolCreateQueryKey.placeholder,
    parameters: [tsc.ots.string(id), 'options', tagsExpression],
  });
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({
  plugin,
}: {
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const symbolJsonValue = plugin.referenceSymbol(
    plugin.api.getSelector('_JSONValue'),
  );

  const properties: Array<Property> = [
    { name: '_id', type: tsc.keywordTypeNode({ keyword: 'string' }) },
    {
      isRequired: false,
      name: getClientBaseUrlKey(plugin.context.config),
      type: tsc.typeReferenceNode({ typeName: symbolJsonValue.placeholder }),
    },
    {
      isRequired: false,
      name: 'query',
      type: tsc.typeReferenceNode({ typeName: symbolJsonValue.placeholder }),
    },
    {
      isRequired: false,
      name: 'tags',
      type: tsc.typeReferenceNode({ typeName: symbolJsonValue.placeholder }),
    },
  ];

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.referenceSymbol(
    sdkPlugin.api.getSelector('Options'),
  );
  const symbolQueryKeyType = plugin.registerSymbol({
    exported: true,
    meta: { kind: 'type' },
    name: 'QueryKey',
    selector: plugin.api.getSelector('QueryKey'),
  });
  const queryKeyType = tsc.typeAliasDeclaration({
    exportType: symbolQueryKeyType.exported,
    name: symbolQueryKeyType.placeholder,
    type: tsc.typeTupleNode({
      types: [
        tsc.typeIntersectionNode({
          types: [
            tsc.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, 'path'>`,
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
  operation,
  plugin,
  symbol,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  symbol: Symbol;
}) => {
  const typeData = useTypeData({ operation, plugin });
  const { strippedTypeData } = getPublicTypeData({ plugin, typeData });
  const statement = tsc.constVariable({
    exportConst: symbol.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: hasOperationDataRequired(operation),
          name: 'options',
          type: strippedTypeData,
        },
      ],
      statements: createQueryKeyLiteral({
        id: operation.id,
        operation,
        plugin,
      }),
    }),
    name: symbol.placeholder,
  });
  return statement;
};

export const ensureQueryKeyInfra = ({
  plugin,
  state,
}: {
  plugin: PiniaColadaPlugin['Instance'];
  state: { hasCreateQueryKeyParamsFunction?: boolean };
}) => {
  if (!state.hasCreateQueryKeyParamsFunction) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
    state.hasCreateQueryKeyParamsFunction = true;
  }
};
