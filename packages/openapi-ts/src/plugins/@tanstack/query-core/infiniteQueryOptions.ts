import ts from 'typescript';

import { clientApi } from '../../../generate/client';
import { operationPagination } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { tsNodeToString } from '../../../tsc/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { handleMeta } from './meta';
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

  const fn = tsc.constVariable({
    expression: tsc.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'queryKey',
          type: tsc.typeReferenceNode({
            typeName: `QueryKey<${clientApi.Options.name}>`,
          }),
        },
        {
          name: 'page',
          type: tsc.typeReferenceNode({ typeName: 'K' }),
        },
      ],
      statements: [
        tsc.constVariable({
          expression: tsc.objectExpression({
            obj: [
              {
                spread: tsc.propertyAccessExpression({
                  expression: 'queryKey',
                  name: 0,
                }),
              },
            ],
          }),
          name: 'params',
        }),
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
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
                  right: tsc.objectExpression({
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
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
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
                  right: tsc.objectExpression({
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
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
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
                  right: tsc.objectExpression({
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
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
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
                  right: tsc.objectExpression({
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
        tsc.returnVariable({
          expression: tsc.asExpression({
            expression: tsc.asExpression({
              expression: tsc.identifier({ text: 'params' }),
              type: tsc.keywordTypeNode({ keyword: 'unknown' }),
            }),
            type: ts.factory.createTypeQueryNode(
              tsc.identifier({ text: 'page' }),
            ),
          }),
        }),
      ],
      types: [
        {
          extends: tsc.typeReferenceNode({
            typeName: tsc.identifier({
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
  // `tsc.returnFunctionCall()` accepts only strings, should be cleaned up
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

  const identifierInfiniteQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-infinite-query-key/${operation.id}`,
    case: plugin.config.infiniteQueryKeys.case,
    nameTransformer: plugin.config.infiniteQueryKeys.name,
    namespace: 'value',
  });

  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: queryFn,
      parameters: [
        tsc.objectExpression({
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
              value: tsc.identifier({
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
    tsc.constVariable({
      comment: [
        {
          jsdoc: false,
          lines: ['@ts-ignore'],
        },
      ],
      expression: tsc.conditionalExpression({
        condition: tsc.binaryExpression({
          left: tsc.typeOfExpression({
            text: 'pageParam',
          }),
          operator: '===',
          right: tsc.ots.string('object'),
        }),
        whenFalse: tsc.objectExpression({
          multiLine: true,
          obj: [
            {
              key: pagination.in,
              value: tsc.objectExpression({
                multiLine: true,
                obj: [
                  {
                    key: pagination.name,
                    value: tsc.identifier({
                      text: 'pageParam',
                    }),
                  },
                ],
              }),
            },
          ],
        }),
        whenTrue: tsc.identifier({
          text: 'pageParam',
        }),
      }),
      name: 'page',
      typeName: typePageObjectParam,
    }),
    tsc.constVariable({
      expression: tsc.callExpression({
        functionName: identifierCreateInfiniteParams.name || '',
        parameters: ['queryKey', 'page'],
      }),
      name: 'params',
    }),
  ];

  if (plugin.getPlugin('@hey-api/sdk')?.config.responseStyle === 'data') {
    statements.push(
      tsc.returnVariable({
        expression: awaitSdkExpression,
      }),
    );
  } else {
    statements.push(
      tsc.constVariable({
        destructure: true,
        expression: awaitSdkExpression,
        name: 'data',
      }),
      tsc.returnVariable({
        expression: 'data',
      }),
    );
  }

  const identifierInfiniteQueryOptions = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-infinite-query-options/${operation.id}`,
    case: plugin.config.infiniteQueryOptions.case,
    create: true,
    nameTransformer: plugin.config.infiniteQueryOptions.name,
    namespace: 'value',
  });

  const infiniteQueryOptionsObj: Array<{ key: string; value: ts.Expression }> =
    [
      {
        key: 'queryFn',
        value: tsc.arrowFunction({
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
        value: tsc.callExpression({
          functionName: identifierInfiniteQueryKey.name || '',
          parameters: ['options'],
        }),
      },
    ];

  const meta = handleMeta(plugin, operation, 'infiniteQueryOptions');

  if (meta) {
    infiniteQueryOptionsObj.push({
      key: 'meta',
      value: meta,
    });
  }

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: typeData,
        },
      ],
      statements: [
        tsc.returnFunctionCall({
          args: [
            tsc.objectExpression({
              comments: [
                {
                  jsdoc: false,
                  lines: ['@ts-ignore'],
                },
              ],
              obj: infiniteQueryOptionsObj,
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
