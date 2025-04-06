import { compiler } from '../../../compiler';
import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import {
  importIdentifierError,
  importIdentifierResponse,
} from '../../@hey-api/typescript/ref';
import type { Plugin } from '../../types';
import type { Config } from './types';
import {
  createParamTypes,
  generateCacheConfig,
  generateFunctionName,
} from './utils';

/**
 * Creates a query function for an operation
 */
export const createQueryFunction = ({
  context,
  file,
  operation,
  plugin,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  // Allow hooks to customize or skip query generation
  if (plugin?.onQuery && plugin.onQuery(operation) === false) {
    return;
  }

  // Import necessary functions and types
  file.import({
    module: '@pinia/colada',
    name: 'defineQuery',
  });

  // Import response type for type parameters
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });
  const identifierError = importIdentifierError({ context, file, operation });

  // Get query key from hooks or generate default
  const queryKey = plugin?.resolveQueryKey?.(operation) ?? [
    operation.tags?.[0] || 'default',
    operation.id,
  ];

  // Get parameter types
  const paramTypes = createParamTypes({ context, operation, plugin });

  // Generate cache configuration
  const cacheConfig = generateCacheConfig(operation, plugin);

  const queryOptions = [
    {
      key: 'key',
      value: compiler.arrayLiteralExpression({
        elements: queryKey.map((k: string) => compiler.ots.string(k)),
      }),
    },
    {
      key: 'query',
      value: compiler.arrowFunction({
        async: true,
        parameters: [],
        statements: [
          compiler.returnStatement({
            expression: compiler.callExpression({
              functionName: 'client',
              parameters: [
                compiler.objectExpression({
                  obj: [
                    {
                      key: 'method',
                      value: operation.method,
                    },
                    {
                      key: 'url',
                      value: operation.path,
                    },
                    ...paramTypes.map(({ key }) => ({
                      key,
                      value: compiler.identifier({ text: key }),
                    })),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    },
    ...cacheConfig,
  ];

  const node = compiler.constVariable({
    comment: [
      operation.deprecated && '@deprecated',
      operation.summary && escapeComment(operation.summary),
      operation.description && escapeComment(operation.description),
    ].filter(Boolean),
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'defineQuery',
      parameters: [
        compiler.objectExpression({
          multiLine: true,
          obj: queryOptions,
        }),
      ],
      types: [
        compiler.typeReferenceNode({
          typeName: identifierResponse?.name || 'unknown',
        }),
        compiler.typeReferenceNode({
          typeName: identifierError?.name || 'unknown',
        }),
      ],
    }),
    name: generateFunctionName(
      operation,
      true,
      plugin.prefixUse,
      plugin.suffixQueryMutation,
    ),
  });

  file.add(node);
};
