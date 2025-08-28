import type { Expression } from 'typescript';

import { clientApi } from '../../../generate/client';
import type { GeneratedFile } from '../../../generate/file';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { type Property, tsc } from '../../../tsc';
import { getClientBaseUrlKey } from '../../@hey-api/client-core/utils';
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './utils';

const createQueryKeyFn = 'createQueryKey';
const queryKeyName = 'QueryKey';
const TOptionsType = 'TOptions';

const optionsIdentifier = tsc.identifier({ text: 'options' });

export const createQueryKeyFunction = ({
  file,
  plugin,
}: {
  file: GeneratedFile;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const identifierCreateQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/pinia-colada-create-query-key/${createQueryKeyFn}`,
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
                      type: tsc.keywordTypeNode({ keyword: 'undefined' }),
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
                    right: tsc.asExpression({
                      expression: tsc.asExpression({
                        expression: tsc.propertyAccessExpression({
                          expression: 'options',
                          name: 'headers',
                        }),
                        type: tsc.keywordTypeNode({ keyword: 'unknown' }),
                      }),
                      type: tsc.keywordTypeNode({ keyword: 'undefined' }),
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
                      type: tsc.keywordTypeNode({ keyword: 'undefined' }),
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
  file,
  id,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  id: string;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const identifierCreateQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/pinia-colada-create-query-key/${createQueryKeyFn}`,
    case: plugin.config.case,
    namespace: 'value',
  });

  const config = plugin.config.queryKeys;
  let tagsExpression: Expression | undefined;
  if (config.tags && operation.tags && operation.tags.length > 0) {
    tagsExpression = tsc.arrayLiteralExpression({
      elements: operation.tags.map((tag) => tsc.stringLiteral({ text: tag })),
    });
  }

  const createQueryKeyCallExpression = tsc.callExpression({
    functionName: identifierCreateQueryKey.name || '',
    parameters: [tsc.ots.string(id), 'options', tagsExpression],
  });
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({
  file,
  plugin,
}: {
  file: GeneratedFile;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  file.import({
    asType: true,
    module: plugin.name,
    name: '_JSONValue',
  });

  const properties: Array<Property> = [
    {
      name: '_id',
      type: tsc.keywordTypeNode({
        keyword: 'string',
      }),
    },
    {
      isRequired: false,
      name: getClientBaseUrlKey(plugin.context.config),
      type: tsc.typeReferenceNode({ typeName: '_JSONValue' }),
    },
    {
      isRequired: false,
      name: 'headers',
      type: tsc.typeReferenceNode({ typeName: '_JSONValue' }),
    },
    {
      isRequired: false,
      name: 'query',
      type: tsc.typeReferenceNode({ typeName: '_JSONValue' }),
    },
    {
      isRequired: false,
      name: 'tags',
      type: tsc.typeReferenceNode({ typeName: '_JSONValue' }),
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
              typeName: `Pick<${TOptionsType}, 'body' | 'path'>`,
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
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const typeData = useTypeData({ file, operation, plugin });
  const identifier = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/pinia-colada-query-key/${operation.id}`,
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
      statements: createQueryKeyLiteral({
        file,
        id: operation.id,
        operation,
        plugin,
      }),
    }),
    name: identifier.name || '',
  });
  return statement;
};
