import ts from 'typescript';

import { compiler } from '../../../compiler';
import { tsNodeToString } from '../../../compiler/utils';
import { clientApi } from '../../../generate/client';
import {
  hasOperationDataRequired,
  operationPagination,
} from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { schemaToType } from '../../@hey-api/typescript/plugin';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyFunctionIdentifier,
  queryKeyName,
  queryKeyStatement,
} from './queryKey';
import type { PluginInstance, PluginState } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const createInfiniteParamsFn = 'createInfiniteParams';
const infiniteQueryOptionsFn = 'infiniteQueryOptions';

const createInfiniteParamsFunction = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const fn = compiler.constVariable({
    expression: compiler.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'queryKey',
          type: compiler.typeReferenceNode({
            typeName: `QueryKey<${clientApi.Options.name}>`,
          }),
        },
        {
          name: 'page',
          type: compiler.typeReferenceNode({ typeName: 'K' }),
        },
      ],
      statements: [
        compiler.constVariable({
          expression: compiler.identifier({
            text: 'queryKey[0]',
          }),
          name: 'params',
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].body',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.body',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        spread: 'queryKey[0].headers',
                      },
                      {
                        spread: 'page.headers',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].path',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.path',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].query',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.query',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.returnVariable({
          expression: ts.factory.createAsExpression(
            ts.factory.createAsExpression(
              compiler.identifier({ text: 'params' }),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ),
            ts.factory.createTypeQueryNode(
              compiler.identifier({ text: 'page' }),
            ),
          ),
        }),
      ],
      types: [
        {
          extends: compiler.typeReferenceNode({
            typeName: compiler.identifier({
              text: `Pick<QueryKey<${clientApi.Options.name}>[0], 'body' | 'headers' | 'path' | 'query'>`,
            }),
          }),
          name: 'K',
        },
      ],
    }),
    name: createInfiniteParamsFn,
  });
  file.add(fn);
};

const infiniteQueryOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}InfiniteOptions`;

export const createInfiniteQueryOptions = ({
  context,
  operation,
  plugin,
  queryFn,
  state,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
  state: PluginState;
}) => {
  if (
    !plugin.infiniteQueryOptions ||
    !(['get', 'post'] as (typeof operation.method)[]).includes(operation.method)
  ) {
    return state;
  }

  const pagination = operationPagination({ context, operation });

  if (!pagination) {
    return state;
  }

  const file = context.file({ id: plugin.name })!;
  const isRequired = hasOperationDataRequired(operation);

  if (!state.hasInfiniteQueries) {
    state.hasInfiniteQueries = true;

    if (!state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ context, plugin });
      createQueryKeyFunction({ context, plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }

    if (!state.hasCreateInfiniteParamsFunction) {
      createInfiniteParamsFunction({ context, plugin });
      state.hasCreateInfiniteParamsFunction = true;
    }

    file.import({
      module: plugin.name,
      name: infiniteQueryOptionsFn,
    });

    state.typeInfiniteData = file.import({
      asType: true,
      module: plugin.name,
      name: 'InfiniteData',
    });
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ context, operation, plugin });
  const typeError = useTypeError({ context, operation, plugin });
  const typeResponse = useTypeResponse({ context, operation, plugin });

  const typeQueryKey = `${queryKeyName}<${typeData}>`;
  const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
  // TODO: parser - this is a bit clunky, need to compile type to string because
  // `compiler.returnFunctionCall()` accepts only strings, should be cleaned up
  const typePageParam = `${tsNodeToString({
    node: schemaToType({
      context,
      plugin: context.config.plugins['@hey-api/typescript'] as Parameters<
        typeof schemaToType
      >[0]['plugin'],
      schema: pagination.schema,
    }),
    unescape: true,
  })} | ${typePageObjectParam}`;

  const node = queryKeyStatement({
    context,
    isInfinite: true,
    operation,
    plugin,
    typeQueryKey,
  });
  file.add(node);

  const infiniteQueryKeyName = queryKeyFunctionIdentifier({
    context,
    isInfinite: true,
    operation,
  });
  const identifierQueryKey = file.identifier({
    $ref: `#/queryKey/${infiniteQueryKeyName}`,
    namespace: 'value',
  });

  const statement = compiler.constVariable({
    // TODO: describe options, same as the actual function call
    comment: [],
    exportConst: true,
    expression: compiler.arrowFunction({
      parameters: [
        {
          isRequired,
          name: 'options',
          type: typeData,
        },
      ],
      statements: [
        compiler.returnFunctionCall({
          args: [
            compiler.objectExpression({
              comments: [
                {
                  jsdoc: false,
                  lines: ['@ts-ignore'],
                },
              ],
              obj: [
                {
                  key: 'queryFn',
                  value: compiler.arrowFunction({
                    async: true,
                    multiLine: true,
                    parameters: [
                      {
                        destructure: [
                          {
                            name: 'pageParam',
                          },
                          {
                            name: 'queryKey',
                          },
                          {
                            name: 'signal',
                          },
                        ],
                      },
                    ],
                    statements: [
                      compiler.constVariable({
                        comment: [
                          {
                            jsdoc: false,
                            lines: ['@ts-ignore'],
                          },
                        ],
                        expression: compiler.conditionalExpression({
                          condition: compiler.binaryExpression({
                            left: compiler.typeOfExpression({
                              text: 'pageParam',
                            }),
                            operator: '===',
                            right: compiler.ots.string('object'),
                          }),
                          whenFalse: compiler.objectExpression({
                            multiLine: true,
                            obj: [
                              {
                                key: pagination.in,
                                value: compiler.objectExpression({
                                  multiLine: true,
                                  obj: [
                                    {
                                      key: pagination.name,
                                      value: compiler.identifier({
                                        text: 'pageParam',
                                      }),
                                    },
                                  ],
                                }),
                              },
                            ],
                          }),
                          whenTrue: compiler.identifier({
                            text: 'pageParam',
                          }),
                        }),
                        name: 'page',
                        typeName: typePageObjectParam,
                      }),
                      compiler.constVariable({
                        expression: compiler.callExpression({
                          functionName: createInfiniteParamsFn,
                          parameters: ['queryKey', 'page'],
                        }),
                        name: 'params',
                      }),
                      compiler.constVariable({
                        destructure: true,
                        expression: compiler.awaitExpression({
                          expression: compiler.callExpression({
                            functionName: queryFn,
                            parameters: [
                              compiler.objectExpression({
                                multiLine: true,
                                obj: [
                                  {
                                    spread: 'options',
                                  },
                                  {
                                    spread: 'params',
                                  },
                                  {
                                    key: 'signal',
                                    shorthand: true,
                                    value: compiler.identifier({
                                      text: 'signal',
                                    }),
                                  },
                                  {
                                    key: 'throwOnError',
                                    value: true,
                                  },
                                ],
                              }),
                            ],
                          }),
                        }),
                        name: 'data',
                      }),
                      compiler.returnVariable({
                        expression: 'data',
                      }),
                    ],
                  }),
                },
                {
                  key: 'queryKey',
                  value: compiler.callExpression({
                    functionName: identifierQueryKey.name || '',
                    parameters: ['options'],
                  }),
                },
              ],
            }),
          ],
          name: infiniteQueryOptionsFn,
          // TODO: better types syntax
          types: [
            typeResponse,
            typeError.name,
            `${typeof state.typeInfiniteData === 'string' ? state.typeInfiniteData : state.typeInfiniteData.name}<${typeResponse}>`,
            typeQueryKey,
            typePageParam,
          ],
        }),
      ],
    }),
    name: infiniteQueryOptionsFunctionIdentifier({
      context,
      operation,
    }),
  });
  file.add(statement);
};
