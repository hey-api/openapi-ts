import type ts from 'typescript';

import { operationPagination } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

/**
 * Create useSWRInfinite options for a given operation.
 *
 * This generates a function that returns an object with:
 * - getKey: A function that generates keys for each page
 * - fetcher: Async function that fetches a single page
 *
 * Example output:
 * export const getUsersInfinite = (options?: GetUsersOptions) => ({
 *   getKey: (pageIndex: number, previousPageData: any) => {
 *     if (previousPageData && !previousPageData.hasMore) return null;
 *     return ['/users', { ...options, page: pageIndex }];
 *   },
 *   fetcher: async (key) => {
 *     const [, params] = key;
 *     const { data } = await getUsers({
 *       ...params,
 *       throwOnError: true,
 *     });
 *     return data;
 *   },
 * });
 */
export const createSwrInfiniteOptions = ({
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

  // Check if this operation supports pagination
  const pagination = operationPagination({
    context: plugin.context,
    operation,
  });

  // Only generate infinite options for operations with pagination
  if (!pagination) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const typeData = useTypeData({ operation, plugin });

  // Create the getKey function
  // getKey: (pageIndex: number, previousPageData: any) => key | null
  // Returns a flat array: ['/path', { path: ... }, { query: ... }, { body: ... }]
  const getKeyFunction = tsc.arrowFunction({
    multiLine: true,
    parameters: [
      {
        name: 'pageIndex',
        type: tsc.typeReferenceNode({ typeName: 'number' }),
      },
      {
        name: 'previousPageData',
        type: tsc.typeReferenceNode({ typeName: 'any' }),
      },
    ],
    statements: [
      // Create page parameter object
      tsc.constVariable({
        expression: tsc.objectExpression({
          multiLine: true,
          obj: [
            {
              key: pagination.in,
              value: tsc.objectExpression({
                obj: [
                  {
                    key: pagination.name,
                    value: tsc.identifier({ text: 'pageIndex' }),
                  },
                ],
              }),
            },
          ],
        }),
        name: 'pageParam',
      }),
      // Build key array similar to swrKey
      tsc.constVariable({
        expression: tsc.arrayLiteralExpression({
          elements: [tsc.stringLiteral({ text: operation.path })],
        }),
        name: 'key',
        typeName: tsc.typeReferenceNode({ typeName: 'any[]' }),
      }),
      // Add path parameters if they exist
      tsc.ifStatement({
        expression: tsc.propertyAccessExpression({
          expression: tsc.identifier({ text: 'options' }),
          isOptional: true,
          name: tsc.identifier({ text: 'path' }),
        }),
        thenStatement: tsc.block({
          statements: [
            tsc.expressionToStatement({
              expression: tsc.callExpression({
                functionName: tsc.propertyAccessExpression({
                  expression: 'key',
                  name: 'push',
                }),
                parameters: [
                  tsc.objectExpression({
                    multiLine: false,
                    obj: [
                      {
                        key: 'path',
                        value: tsc.propertyAccessExpression({
                          expression: 'options',
                          name: 'path',
                        }),
                      },
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
      // Add query parameters (merged with pageParam)
      tsc.constVariable({
        expression: tsc.objectExpression({
          multiLine: false,
          obj: [
            {
              spread: tsc.propertyAccessExpression({
                expression: 'options',
                isOptional: true,
                name: 'query',
              }),
            },
            {
              spread: tsc.propertyAccessExpression({
                expression: 'pageParam',
                name: pagination.in,
              }),
            },
          ],
        }),
        name: 'mergedQuery',
      }),
      tsc.expressionToStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: 'key',
            name: 'push',
          }),
          parameters: [
            tsc.objectExpression({
              multiLine: false,
              obj: [
                {
                  key: 'query',
                  value: tsc.identifier({ text: 'mergedQuery' }),
                },
              ],
            }),
          ],
        }),
      }),
      // Add body if it exists
      tsc.ifStatement({
        expression: tsc.propertyAccessExpression({
          expression: tsc.identifier({ text: 'options' }),
          isOptional: true,
          name: tsc.identifier({ text: 'body' }),
        }),
        thenStatement: tsc.block({
          statements: [
            tsc.expressionToStatement({
              expression: tsc.callExpression({
                functionName: tsc.propertyAccessExpression({
                  expression: 'key',
                  name: 'push',
                }),
                parameters: [
                  tsc.objectExpression({
                    multiLine: false,
                    obj: [
                      {
                        key: 'body',
                        value: tsc.propertyAccessExpression({
                          expression: 'options',
                          name: 'body',
                        }),
                      },
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
      // return key
      tsc.returnStatement({
        expression: tsc.identifier({ text: 'key' }),
      }),
    ],
  });

  // Create the fetcher function
  // fetcher: async (key) => { ... }
  // key structure: ['/path', { path: ... }, { query: ... }, { body: ... }]
  // Merge all objects after the first element (path string)

  const fetcherStatements: Array<ts.Statement> = [];

  // Create params variable by merging all objects in the key array (excluding the first path string)
  fetcherStatements.push(
    tsc.constVariable({
      expression: tsc.identifier({
        text: 'Object.assign({}, ...key.slice(1))',
      }),
      name: 'params',
    }),
  );

  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: sdkFn,
      parameters: [
        tsc.objectExpression({
          multiLine: true,
          obj: [
            {
              spread: 'params',
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

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    fetcherStatements.push(
      tsc.returnVariable({
        expression: awaitSdkExpression,
      }),
    );
  } else {
    fetcherStatements.push(
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

  const fetcherFunction = tsc.arrowFunction({
    async: true,
    multiLine: true,
    parameters: [
      {
        name: 'key',
      },
    ],
    statements: fetcherStatements,
  });

  // Build the infinite options object
  const swrInfiniteOptionsObj = tsc.objectExpression({
    obj: [
      {
        key: 'getKey',
        value: getKeyFunction,
      },
      {
        key: 'fetcher',
        value: fetcherFunction,
      },
    ],
  });

  // Register the infinite options symbol
  const symbolSwrInfiniteOptionsFn = plugin.registerSymbol({
    exported: plugin.config.swrInfiniteOptions.exported,
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'swrInfiniteOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.swrInfiniteOptions,
      name: operation.id,
    }),
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolSwrInfiniteOptionsFn.exported,
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
          expression: swrInfiniteOptionsObj,
        }),
      ],
    }),
    name: symbolSwrInfiniteOptionsFn.placeholder,
  });

  plugin.setSymbolValue(symbolSwrInfiniteOptionsFn, statement);
};
