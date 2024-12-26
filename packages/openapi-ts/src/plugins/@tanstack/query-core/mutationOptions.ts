import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import type { PluginInstance, PluginState } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const mutationOptionsFn = 'mutationOptions';

const mutationOptionsFunctionIdentifier = ({
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
  })}Mutation`;

export const createMutationOptions = ({
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
    !plugin.mutationOptions ||
    !(
      ['delete', 'patch', 'post', 'put'] as (typeof operation.method)[]
    ).includes(operation.method)
  ) {
    return state;
  }

  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';

  const file = context.file({ id: plugin.name })!;

  if (!state.hasMutations) {
    state.hasMutations = true;

    file.import({
      asType: true,
      module: plugin.name,
      name: mutationsType,
    });
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ context, operation, plugin });
  const typeError = useTypeError({ context, operation, plugin });
  const typeResponse = useTypeResponse({ context, operation, plugin });

  const expression = compiler.arrowFunction({
    parameters: [
      {
        isRequired: false,
        name: 'options',
        type: `Partial<${typeData}>`,
      },
    ],
    statements: [
      compiler.constVariable({
        expression: compiler.objectExpression({
          obj: [
            {
              key: 'mutationFn',
              value: compiler.arrowFunction({
                async: true,
                multiLine: true,
                parameters: [
                  {
                    name: 'localOptions',
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
                                spread: 'localOptions',
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
          ],
        }),
        name: mutationOptionsFn,
        // TODO: better types syntax
        typeName: `${mutationsType}<${typeResponse}, ${typeError.name}, ${typeData}>`,
      }),
      compiler.returnVariable({
        expression: mutationOptionsFn,
      }),
    ],
  });
  const statement = compiler.constVariable({
    // TODO: describe options, same as the actual function call
    comment: [],
    exportConst: true,
    expression,
    name: mutationOptionsFunctionIdentifier({ context, operation }),
  });
  file.add(statement);

  return state;
};
