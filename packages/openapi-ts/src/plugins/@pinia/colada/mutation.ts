import { compiler } from '../../../compiler';
import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import {
  importIdentifierData,
  importIdentifierError,
  importIdentifierResponse,
} from '../../@hey-api/typescript/ref';
import type { Plugin } from '../../types';
import type { Config } from './types';
import { createParamTypes, generateFunctionName } from './utils';

/**
 * Creates a mutation function for an operation
 */
export const createMutationFunction = ({
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
  // Allow hooks to customize or skip mutation generation
  if (plugin?.onMutation && plugin.onMutation(operation) === false) {
    return;
  }

  // Import necessary functions and types
  file.import({
    module: '@pinia/colada',
    name: 'defineMutation',
  });

  // Import response/error/data types for type parameters
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });
  const identifierError = importIdentifierError({ context, file, operation });
  const identifierData = importIdentifierData({ context, file, operation });

  // Get parameter types
  const paramTypes = createParamTypes({ context, operation, plugin });

  const mutationOptions = [
    {
      key: 'mutation',
      value: compiler.arrowFunction({
        async: true,
        parameters: [
          {
            name: 'data',
            type: identifierData?.name
              ? compiler.typeReferenceNode({
                  typeName: identifierData.name,
                })
              : undefined,
          },
        ],
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
                    // Only include data if it's a valid body parameter
                    operation.body
                      ? {
                          key: 'data',
                          shorthand: true,
                          value: compiler.identifier({ text: 'data' }),
                        }
                      : null,
                    ...paramTypes.map(({ key }) => ({
                      key,
                      value: compiler.identifier({ text: key }),
                    })),
                  ].filter(Boolean),
                }),
              ],
            }),
          }),
        ],
      }),
    },
  ];

  const node = compiler.constVariable({
    comment: [
      operation.deprecated && '@deprecated',
      operation.summary && escapeComment(operation.summary),
      operation.description && escapeComment(operation.description),
    ].filter(Boolean),
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'defineMutation',
      parameters: [
        compiler.objectExpression({
          multiLine: true,
          obj: mutationOptions,
        }),
      ],
      types: [
        compiler.typeReferenceNode({
          typeName: identifierData?.name || 'unknown',
        }),
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
      false,
      plugin.prefixUse,
      plugin.suffixQueryMutation,
    ),
  });

  file.add(node);
};
