import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
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
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const name = serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  });

  let customName = '';

  if (plugin.queryOptionsNameBuilder) {
    if (typeof plugin.queryOptionsNameBuilder === 'function') {
      customName = plugin.queryOptionsNameBuilder(name);
    } else {
      customName = plugin.queryOptionsNameBuilder.replace('{{name}}', name);
    }
  }

  return customName;
};

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
  const isRequiredOptions = isOperationOptionsRequired({ context, operation });

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
    operation,
    plugin,
  });
  const identifierQueryKey = file.identifier({
    $ref: `#/queryKey/${queryKeyName}`,
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
  });

  const statements: Array<ts.Statement> = [];

  if (context.config.plugins['@hey-api/sdk']?.responseStyle === 'data') {
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

  const statement = compiler.constVariable({
    comment: plugin.comments
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
                    statements,
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
    name: queryOptionsFunctionIdentifier({ context, operation, plugin }),
    // TODO: add type error
    // TODO: AxiosError<PutSubmissionMetaError>
  });
  file.add(statement);

  return state;
};
