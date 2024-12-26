import { compiler } from '../../../compiler';
import { hasOperationDataRequired } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyFunctionIdentifier,
  queryKeyStatement,
} from './queryKey';
import type { PluginInstance, PluginState } from './types';
import { useTypeData } from './useType';

const queryOptionsFn = 'queryOptions';

const queryOptionsFunctionIdentifier = ({
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
  })}Options`;

export const createQueryOptions = ({
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
    !plugin.queryOptions ||
    !(['get', 'post'] as (typeof operation.method)[]).includes(operation.method)
  ) {
    return state;
  }

  const file = context.file({ id: plugin.name })!;
  const isRequired = hasOperationDataRequired(operation);

  if (!state.hasQueries) {
    state.hasQueries = true;

    if (!state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ context, plugin });
      createQueryKeyFunction({ context, plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }

    file.import({
      module: plugin.name,
      name: queryOptionsFn,
    });
  }

  state.hasUsedQueryFn = true;

  const node = queryKeyStatement({
    context,
    isInfinite: false,
    operation,
    plugin,
  });
  file.add(node);

  const typeData = useTypeData({ context, operation, plugin });

  const queryKeyName = queryKeyFunctionIdentifier({
    context,
    isInfinite: false,
    operation,
  });
  const identifierQueryKey = file.identifier({
    $ref: `#/queryKey/${queryKeyName}`,
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
                                    spread: 'queryKey[0]',
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
          name: queryOptionsFn,
        }),
      ],
    }),
    name: queryOptionsFunctionIdentifier({ context, operation }),
    // TODO: add type error
    // TODO: AxiosError<PutSubmissionMetaError>
  });
  file.add(statement);

  return state;
};
