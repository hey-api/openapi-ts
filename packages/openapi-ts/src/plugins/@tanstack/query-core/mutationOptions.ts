import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { createOperationComment } from '../../shared/utils/operation';
import { handleMeta } from './meta';
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
    !plugin.hooks.operation.isMutation(operation)
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

  const identifier = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-mutation-options/${operation.id}`,
    case: plugin.config.mutationOptions.case,
    create: true,
    nameTransformer: plugin.config.mutationOptions.name,
    namespace: 'value',
  });

  const mutationOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'mutationFn',
      value: tsc.arrowFunction({
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
  ];

  const meta = handleMeta(plugin, operation, 'mutationOptions');

  if (meta) {
    mutationOptionsObj.push({
      key: 'meta',
      value: meta,
    });
  }

  const expression = tsc.arrowFunction({
    parameters: [
      {
        isRequired: false,
        name: 'options',
        type: `Partial<${typeData}>`,
      },
    ],
    returnType: mutationType,
    statements: [
      tsc.constVariable({
        expression: tsc.objectExpression({
          obj: mutationOptionsObj,
        }),
        name: mutationOptionsFn,
        typeName: mutationType,
      }),
      tsc.returnVariable({
        expression: mutationOptionsFn,
      }),
    ],
  });
  const statement = tsc.constVariable({
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
