import ts from 'typescript';

import { compiler } from '../../../compiler';
import { tsNodeToString } from '../../../compiler/utils';
import { clientApi } from '../../../generate/client';
import { operationPagination } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyName,
  queryKeyStatement,
} from './queryKey';
import type { PluginInstance, PluginState } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const createInfiniteParamsFn = 'createInfiniteParams';
const infiniteQueryOptionsFn = 'infiniteQueryOptions';

const createInfiniteParamsFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;

  const identifierCreateInfiniteParams = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-create-infinite-params/${createInfiniteParamsFn}`,
    case: plugin.config.case,
    create: true,
    namespace: 'value',
  });

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
          expression: compiler.objectExpression({
            obj: [
              {
                spread: compiler.propertyAccessExpression({
                  expression: 'queryKey',
                  name: 0,
                }),
              },
            ],
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
          expression: compiler.asExpression({
            expression: compiler.asExpression({
              expression: compiler.identifier({ text: 'params' }),
              type: compiler.keywordTypeNode({ keyword: 'unknown' }),
            }),
            type: ts.factory.createTypeQueryNode(
              compiler.identifier({ text: 'page' }),
            ),
          }),
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
    name: identifierCreateInfiniteParams.name || '',
  });
  file.add(fn);
};

export const createInfiniteQueryOptions = ({
  operation,
  plugin,
  queryFn,
  state,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
  state: PluginState;
}) => {
  if (
    !plugin.config.infiniteQueryOptions ||
    !(['get', 'post'] as ReadonlyArray<typeof operation.method>).includes(
      operation.method,
    )
  ) {
    return state;
  }

  const pagination = operationPagination({
    context: plugin.context,
    operation,
  });

  if (!pagination) {
    return state;
  }

  const file = plugin.context.file({ id: plugin.name })!;
  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!state.hasInfiniteQueries) {
    state.hasInfiniteQueries = true;

    if (!state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ plugin });
      createQueryKeyFunction({ plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }

    if (!state.hasCreateInfiniteParamsFunction) {
      createInfiniteParamsFunction({ plugin });
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

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  const typeQueryKey = `${queryKeyName}<${typeData}>`;
  const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  // TODO: parser - this is a bit clunky, need to compile type to string because
  // `compiler.returnFunctionCall()` accepts only strings, should be cleaned up
  const typescriptState = {
    usedTypeIDs: new Set<string>(),
  };
  const type = pluginTypeScript.api.schemaToType({
    plugin: pluginTypeScript,
    schema: pagination.schema,
    state: typescriptState,
  });
  const typePageParam = `${tsNodeToString({
    node: type,
    unescape: true,
  })} | ${typePageObjectParam}`;

  const node = queryKeyStatement({
    isInfinite: true,
    operation,
    plugin,
    typeQueryKey,
  });
  file.add(node);

  const functionIdentifier = serviceFunctionIdentifier({
    config: plugin.context.config,
    id: operation.id,
    operation,
  });

  const identifierInfiniteQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-infinite-query-key/${functionIdentifier}`,
    case: plugin.config.infiniteQueryKeys.case,
    nameTransformer: plugin.config.infiniteQueryKeys.name,
    namespace: 'value',
  });

  const awaitSdkExpression = compiler.awaitExpression({
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
  });

  const identifierCreateInfiniteParams = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-create-infinite-params/${createInfiniteParamsFn}`,
    case: plugin.config.case,
    namespace: 'value',
  });

  const statements: Array<ts.Statement> = [
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
        functionName: identifierCreateInfiniteParams.name || '',
        parameters: ['queryKey', 'page'],
      }),
      name: 'params',
    }),
  ];

  if (plugin.getPlugin('@hey-api/sdk')?.config.responseStyle === 'data') {
    statements.push(
      compiler.returnVariable({
        expression: awaitSdkExpression,
      }),
    );
  } else {
    statements.push(
      compiler.constVariable({
        destructure: true,
        expression: awaitSdkExpression,
        name: 'data',
      }),
      compiler.returnVariable({
        expression: 'data',
      }),
    );
  }

  const identifierInfiniteQueryOptions = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-infinite-query-options/${functionIdentifier}`,
    case: plugin.config.infiniteQueryOptions.case,
    create: true,
    nameTransformer: plugin.config.infiniteQueryOptions.name,
    namespace: 'value',
  });

  const statement = compiler.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: compiler.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
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
                    statements,
                  }),
                },
                {
                  key: 'queryKey',
                  value: compiler.callExpression({
                    functionName: identifierInfiniteQueryKey.name || '',
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
            typeError.name || 'unknown',
            `${typeof state.typeInfiniteData === 'string' ? state.typeInfiniteData : state.typeInfiniteData.name}<${typeResponse}>`,
            typeQueryKey,
            typePageParam,
          ],
        }),
      ],
    }),
    name: identifierInfiniteQueryOptions.name || '',
  });
  file.add(statement);
  return;
};
