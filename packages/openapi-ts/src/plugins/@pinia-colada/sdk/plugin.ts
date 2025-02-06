import { compiler } from '../../../compiler';
import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import { stringCase } from '../../../utils/stringCase';
import {
  importIdentifierData,
  importIdentifierError,
  importIdentifierResponse,
} from '../../@hey-api/typescript/ref';
import type { Plugin } from '../../types';
import type { Config } from './types';

const createQueryFunction = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: plugin.name })!;

  // Allow hooks to customize or skip query generation
  if (plugin.hooks?.onQuery && plugin.hooks.onQuery(operation) === false) {
    return;
  }

  // Get query key from hooks or generate default
  const queryKey = plugin.hooks?.getQueryKey?.(operation) ?? [
    operation.tags?.[0] || 'default',
    operation.id,
  ];

  // Import response type for type parameters
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });
  const identifierError = importIdentifierError({ context, file, operation });

  const queryFn = compiler.arrowFunction({
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
              ],
            }),
          ],
        }),
      }),
    ],
  });

  const node = compiler.constVariable({
    comment: [
      operation.deprecated && '@deprecated',
      operation.summary && escapeComment(operation.summary),
      operation.description && escapeComment(operation.description),
    ],
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'defineQuery',
      parameters: [
        compiler.objectExpression({
          obj: [
            {
              key: 'key',
              value: compiler.arrayLiteralExpression({
                elements: queryKey.map((k: string) => compiler.ots.string(k)),
              }),
            },
            {
              key: 'query',
              value: queryFn,
            },
          ],
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
    name: `use${stringCase({ case: 'PascalCase', value: operation.id })}Query`,
  });

  file.import({
    module: '@pinia/colada',
    name: 'defineQuery',
  });

  file.add(node);
};

const createMutationFunction = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: plugin.name })!;

  // Allow hooks to customize or skip mutation generation
  if (
    plugin.hooks?.onMutation &&
    plugin.hooks.onMutation(operation) === false
  ) {
    return;
  }

  // Import response type for type parameters
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });
  const identifierError = importIdentifierError({ context, file, operation });
  const identifierData = importIdentifierData({ context, file, operation });

  const mutationFn = compiler.arrowFunction({
    async: true,
    parameters: [
      {
        name: 'data',
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
                {
                  key: 'data',
                  shorthand: true,
                  value: compiler.identifier({ text: 'data' }),
                },
              ],
            }),
          ],
        }),
      }),
    ],
  });

  const node = compiler.constVariable({
    comment: [
      operation.deprecated && '@deprecated',
      operation.summary && escapeComment(operation.summary),
      operation.description && escapeComment(operation.description),
    ],
    exportConst: true,
    expression: compiler.callExpression({
      functionName: 'defineMutation',
      parameters: [
        compiler.objectExpression({
          obj: [
            {
              key: 'mutation',
              value: mutationFn,
            },
          ],
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
    name: `use${stringCase({ case: 'PascalCase', value: operation.id })}Mutation`,
  });

  file.import({
    module: '@pinia/colada',
    name: 'defineMutation',
  });

  file.add(node);
};

export const handler: Plugin.Handler<Config> = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  // Create files based on grouping strategy
  const files = new Map<string, TypeScriptFile>();

  const getFile = (tag: string) => {
    if (!plugin.groupByTag) {
      return context.file({ id: plugin.name })!;
    }

    const fileId = `${plugin.name}/${tag}`;
    if (!files.has(fileId)) {
      files.set(
        fileId,
        context.createFile({
          exportFromIndex: plugin.exportFromIndex,
          id: fileId,
          path: `${plugin.output}/${tag}`,
        }),
      );
    }
    return files.get(fileId)!;
  };

  const isQuery = (operation: IR.OperationObject): boolean => {
    // 1. Check for hook override
    const hookResult = plugin.hooks?.isQuery?.(operation);
    if (hookResult !== undefined) {
      return hookResult;
    }

    // 2. Check for explicit override
    // TODO: parser - add support for extensions in operation object to enhance mutability detection
    /* if (operation.extensions?.['x-readonly'] !== undefined) {
      return operation.extensions['x-readonly'];
    } */

    // 3. Use method as primary signal
    if (['get', 'delete'].includes(operation.method)) {
      return true;
    }

    // 4. Consider body presence as secondary signal
    // If method is not GET/DELETE but also has no body schema, likely a query
    return !operation.body?.schema;
  };

  context.subscribe(
    'operation',
    ({ operation }: { operation: IR.OperationObject }) => {
      getFile(operation.tags?.[0] || 'default');

      if (isQuery(operation)) {
        createQueryFunction({ context, operation, plugin });
      } else {
        createMutationFunction({ context, operation, plugin });
      }
    },
  );
};
