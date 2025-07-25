import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PluginInstance, PluginState } from './types';
import { useTypeData } from './useType';

const queryOptionsFn = 'queryOptions';

export const createQueryOptions = ({
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
    !plugin.config.queryOptions ||
    !(['get', 'post'] as ReadonlyArray<typeof operation.method>).includes(
      operation.method,
    )
  ) {
    return state;
  }

  const file = plugin.context.file({ id: plugin.name })!;
  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!state.hasQueries) {
    state.hasQueries = true;

    if (!state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ plugin });
      createQueryKeyFunction({ plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }

    file.import({
      module: plugin.name,
      name: queryOptionsFn,
    });
  }

  state.hasUsedQueryFn = true;

  const node = queryKeyStatement({
    isInfinite: false,
    operation,
    plugin,
  });
  file.add(node);

  const typeData = useTypeData({ operation, plugin });

  const identifierQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-query-key/${operation.id}`,
    case: plugin.config.queryKeys.case,
    nameTransformer: plugin.config.queryKeys.name,
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
              spread: 'queryKey[0]',
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

  const statements: Array<ts.Statement> = [];

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

  const identifierQueryOptions = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-query-options/${operation.id}`,
    case: plugin.config.queryOptions.case,
    create: true,
    nameTransformer: plugin.config.queryOptions.name,
    namespace: 'value',
  });

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
              obj: [
                {
                  key: 'queryFn',
                  value: tsc.arrowFunction({
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
                    statements,
                  }),
                },
                {
                  key: 'queryKey',
                  value: tsc.callExpression({
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
    name: identifierQueryOptions.name || '',
    // TODO: add type error
    // TODO: AxiosError<PutSubmissionMetaError>
  });
  file.add(statement);

  return state;
};
