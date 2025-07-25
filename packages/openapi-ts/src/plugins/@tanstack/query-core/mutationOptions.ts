import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { createOperationComment } from '../../shared/utils/operation';
import type { PluginInstance, PluginState } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const mutationOptionsFn = 'mutationOptions';

export const createMutationOptions = ({
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
    !plugin.config.mutationOptions.enabled ||
    !(
      ['delete', 'patch', 'post', 'put'] as ReadonlyArray<
        typeof operation.method
      >
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

  const file = plugin.context.file({ id: plugin.name })!;

  if (!state.hasMutations) {
    state.hasMutations = true;

    file.import({
      asType: true,
      module: plugin.name,
      name: mutationsType,
    });
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  // TODO: better types syntax
  const mutationType = `${mutationsType}<${typeResponse}, ${typeError.name}, ${typeData}>`;

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
  });

  const statements: Array<ts.Statement> = [];

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

  const functionIdentifier = serviceFunctionIdentifier({
    config: plugin.context.config,
    id: operation.id,
    operation,
  });

  const identifier = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-mutation-options/${functionIdentifier}`,
    case: plugin.config.mutationOptions.case,
    create: true,
    nameTransformer: plugin.config.mutationOptions.name,
    namespace: 'value',
  });

  const expression = compiler.arrowFunction({
    parameters: [
      {
        isRequired: false,
        name: 'options',
        type: `Partial<${typeData}>`,
      },
    ],
    returnType: mutationType,
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
                statements,
              }),
            },
          ],
        }),
        name: mutationOptionsFn,
        typeName: mutationType,
      }),
      compiler.returnVariable({
        expression: mutationOptionsFn,
      }),
    ],
  });
  const statement = compiler.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression,
    name: identifier.name || '',
  });
  file.add(statement);

  return state;
};
