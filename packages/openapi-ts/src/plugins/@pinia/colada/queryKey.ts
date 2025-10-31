import type { Symbol } from '@hey-api/codegen-core';
import type { Expression } from 'typescript';

import { clientFolderAbsolutePath } from '~/generate/client';
import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { getClientBaseUrlKey } from '~/plugins/@hey-api/client-core/utils';
import { type Property, tsc } from '~/tsc';

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
  const symbolJsonValue = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}._JSONValue`,
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

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolClient = plugin.getSymbol({
    category: 'client',
  });

  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const symbolSerializeQueryValue = plugin.registerSymbol({
    external: clientModule,
    meta: {
      category: 'external',
      resource: `${clientModule}.serializeQueryKeyValue`,
    },
    name: 'serializeQueryKeyValue',
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
          expression: tsc.binaryExpression({
            left: tsc.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: tsc.identifier({ text: 'body' }),
            }),
            operator: '!==',
            right: 'undefined',
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.constVariable({
                expression: tsc.callExpression({
                  functionName: symbolSerializeQueryValue.placeholder,
                  parameters: [
                    tsc.propertyAccessExpression({
                      expression: 'options',
                      name: 'body',
                    }),
                  ],
                }),
                name: 'normalizedBody',
              }),
              tsc.ifStatement({
                expression: tsc.binaryExpression({
                  left: tsc.identifier({ text: 'normalizedBody' }),
                  operator: '!==',
                  right: 'undefined',
                }),
                thenStatement: tsc.block({
                  statements: [
                    tsc.expressionToStatement({
                      expression: tsc.binaryExpression({
                        left: tsc.propertyAccessExpression({
                          expression: 'params',
                          name: 'body',
                        }),
                        right: tsc.identifier({ text: 'normalizedBody' }),
                      }),
                    }),
                  ],
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
          expression: tsc.binaryExpression({
            left: tsc.propertyAccessExpression({
              expression: optionsIdentifier,
              isOptional: true,
              name: tsc.identifier({ text: 'query' }),
            }),
            operator: '!==',
            right: 'undefined',
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.constVariable({
                expression: tsc.callExpression({
                  functionName: symbolSerializeQueryValue.placeholder,
                  parameters: [
                    tsc.propertyAccessExpression({
                      expression: 'options',
                      name: 'query',
                    }),
                  ],
                }),
                name: 'normalizedQuery',
              }),
              tsc.ifStatement({
                expression: tsc.binaryExpression({
                  left: tsc.identifier({ text: 'normalizedQuery' }),
                  operator: '!==',
                  right: 'undefined',
                }),
                thenStatement: tsc.block({
                  statements: [
                    tsc.expressionToStatement({
                      expression: tsc.binaryExpression({
                        left: tsc.propertyAccessExpression({
                          expression: 'params',
                          name: 'query',
                        }),
                        right: tsc.identifier({ text: 'normalizedQuery' }),
                      }),
                    }),
                  ],
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

  const symbolCreateQueryKey = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createQueryKey',
    tool: plugin.name,
  });
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
  const symbolJsonValue = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}._JSONValue`,
  });

  const properties: Array<Property> = [
    { name: '_id', type: tsc.keywordTypeNode({ keyword: 'string' }) },
    {
      isRequired: false,
      name: getClientBaseUrlKey(plugin.context.config),
      type: tsc.typeReferenceNode({ typeName: symbolJsonValue.placeholder }),
    },
    {
      isRequired: false,
      name: 'body',
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
