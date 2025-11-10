import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import { registerSwrKey } from './swrKey';
import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

/**
 * Create useSWR options for a given operation.
 *
 * This generates a function that returns an object with:
 * - key: The SWR key (array or string)
 * - fetcher: Async function that calls the SDK function
 *
 * Example output:
 * export const getUserByIdOptions = (options: GetUserByIdOptions) => ({
 *   key: getUserByIdKey(options),
 *   fetcher: async () => {
 *     const { data } = await getUserById({
 *       ...options,
 *       throwOnError: true,
 *     });
 *     return data;
 *   },
 * });
 */
export const createSwrOptions = ({
  operation,
  plugin,
  sdkFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  sdkFn: string;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  // Register SWR key first
  const symbolSwrKey = registerSwrKey({ operation, plugin });

  const typeData = useTypeData({ operation, plugin });

  // Create the SDK function call
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
  const swrOptionsObj = tsc.objectExpression({
    obj: [
      {
        key: 'key',
        value: tsc.callExpression({
          functionName: symbolSwrKey.placeholder,
          parameters: [optionsParamName],
        }),
      },
      {
        key: 'fetcher',
        value: tsc.arrowFunction({
          async: true,
          multiLine: true,
          statements,
        }),
      },
    ],
  });

  // Register the options symbol
  const symbolSwrOptionsFn = plugin.registerSymbol({
    exported: plugin.config.swrOptions.exported,
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'swrOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.swrOptions,
      name: operation.id,
    }),
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolSwrOptionsFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: optionsParamName,
          type: typeData,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: swrOptionsObj,
        }),
      ],
    }),
    name: symbolSwrOptionsFn.placeholder,
  });

  plugin.setSymbolValue(symbolSwrOptionsFn, statement);
};
