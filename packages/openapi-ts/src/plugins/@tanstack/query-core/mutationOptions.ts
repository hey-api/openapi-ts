import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { createOperationComment } from '../../shared/utils/operation';
import type { PluginInstance, PluginState } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const mutationOptionsFn = 'mutationOptions';

const mutationOptionsFunctionIdentifier = ({
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

  if (plugin.mutationOptionsNameBuilder) {
    if (typeof plugin.mutationOptionsNameBuilder === 'function') {
      customName = plugin.mutationOptionsNameBuilder(name);
    } else {
      customName = plugin.mutationOptionsNameBuilder.replace('{{name}}', name);
    }
  }

  return customName;
};

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
    comment: plugin.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression,
    name: mutationOptionsFunctionIdentifier({ context, operation, plugin }),
  });
  file.add(statement);

  return state;
};
