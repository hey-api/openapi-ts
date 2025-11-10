import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

/**
 * Create useSWRMutation options for a given operation.
 *
 * This generates a function that returns an object with:
 * - key: The mutation key (usually the operation path)
 * - fetcher: Async function that calls the SDK function with arg parameter
 *
 * Example output:
 * export const createUserMutation = (options?: CreateUserOptions) => ({
 *   key: '/api/users',
 *   fetcher: async (arg) => {
 *     const { data } = await createUser({
 *       ...options,
 *       ...arg,
 *       throwOnError: true,
 *     });
 *     return data;
 *   },
 * });
 */
export const createSwrMutationOptions = ({
  operation,
  plugin,
  sdkFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  sdkFn: string;
}): void => {
  const typeData = useTypeData({ operation, plugin });

  // Create the SDK function call with arg parameter
  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: sdkFn,
      parameters: [
        tsc.objectExpression({
          multiLine: true,
          obj: [
            {
              spread: optionsParamName,
            },
            {
              spread: 'arg',
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

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
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

  // Build the options object
  const swrMutationOptionsObj = tsc.objectExpression({
    obj: [
      {
        key: 'key',
        value: tsc.stringLiteral({ text: operation.path }),
      },
      {
        key: 'fetcher',
        value: tsc.arrowFunction({
          async: true,
          multiLine: true,
          parameters: [
            {
              name: '_key',
              type: tsc.keywordTypeNode({
                keyword: 'unknown',
              }),
            },
            {
              destructure: [
                {
                  name: 'arg',
                },
              ],
              name: undefined,
              type: tsc.typeInterfaceNode({
                properties: [
                  {
                    isRequired: true,
                    name: 'arg',
                    type: typeData,
                  },
                ],
                useLegacyResolution: false,
              }),
            },
          ],
          statements,
        }),
      },
    ],
  });

  // Register the mutation options symbol
  const symbolSwrMutationOptionsFn = plugin.registerSymbol({
    exported: plugin.config.swrMutationOptions.exported,
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'swrMutationOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.swrMutationOptions,
      name: operation.id,
    }),
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolSwrMutationOptionsFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: false,
          name: optionsParamName,
          type: typeData,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: swrMutationOptionsObj,
        }),
      ],
    }),
    name: symbolSwrMutationOptionsFn.placeholder,
  });

  plugin.setSymbolValue(symbolSwrMutationOptionsFn, statement);
};
