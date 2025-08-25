import type ts from 'typescript';

import { clientApi } from '../../../generate/client';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { sdkId } from '../../@hey-api/sdk/constants';
import {
  operationClasses,
  operationOptionsType,
} from '../../@hey-api/sdk/operation';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { PiniaColadaPlugin } from './types';

type PluginHandler = PiniaColadaPlugin['Handler'];
type PluginInstance = PiniaColadaPlugin['Instance'];

interface PluginState {
  hasMutations: boolean;
  hasQueries: boolean;
  hasUsedQueryFn: boolean;
}

const handleMeta = (
  plugin: PluginInstance,
  operation: IR.OperationObject,
  type: 'queryOptions' | 'mutationOptions',
): ts.Expression | undefined => {
  const metaConfig = plugin.config[type].meta;

  if (typeof metaConfig !== 'function') {
    return undefined;
  }

  const customMeta = metaConfig(operation);

  return tsc.valueToExpression({ value: customMeta });
};

const useTypeData = ({
  file,
  operation,
  plugin,
}: {
  file: ReturnType<PluginInstance['createFile']>;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const pluginSdk = plugin.getPlugin('@hey-api/sdk')!;
  const typeData = operationOptionsType({ file, operation, plugin: pluginSdk });
  return typeData;
};

const shouldGenerateQuery = (
  operation: IR.OperationObject,
  plugin: PluginInstance,
): boolean => {
  // Check for explicit override first
  const override = plugin.config.operationTypes[operation.id];
  if (override === 'mutation') return false;
  if (override === 'query' || override === 'both') return true;

  // Use auto-detection if enabled
  if (plugin.config.autoDetectHttpMethod) {
    return operation.method === 'get';
  }

  // Default behavior (backward compatibility)
  return ['get', 'post'].includes(operation.method);
};

const shouldGenerateMutation = (
  operation: IR.OperationObject,
  plugin: PluginInstance,
): boolean => {
  // Check for explicit override first
  const override = plugin.config.operationTypes[operation.id];
  if (override === 'query') return false;
  if (override === 'mutation' || override === 'both') return true;

  // Use auto-detection if enabled
  if (plugin.config.autoDetectHttpMethod) {
    return operation.method !== 'get';
  }

  // Default behavior (backward compatibility)
  return operation.method !== 'get';
};

const createQueryOptions = ({
  file,
  operation,
  plugin,
  queryFn,
  state,
}: {
  file: ReturnType<PluginInstance['createFile']>;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
  state: PluginState;
}) => {
  if (!plugin.config.queryOptions || !shouldGenerateQuery(operation, plugin)) {
    return state;
  }
  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!state.hasQueries) {
    state.hasQueries = true;
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ file, operation, plugin });

  const identifierQueryOptions = file.identifier({
    $ref: `#/pinia-colada-query-options/${operation.id}`,
    case: plugin.config.queryOptions.case,
    create: true,
    nameTransformer: plugin.config.queryOptions.name,
    namespace: 'value',
  });

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
              key: 'signal',
              value: tsc.identifier({
                text: 'context.signal',
              }),
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

  // Generate query options object for Pinia Colada
  const queryOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'key',
      value: tsc.arrayLiteralExpression({
        elements: [
          tsc.stringLiteral({ text: operation.id || '' }),
          tsc.identifier({ text: 'options?.path' }),
        ],
      }),
    },
    {
      key: 'query',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          {
            name: 'context',
            type: tsc.typeReferenceNode({
              typeName: '{ signal: AbortSignal }',
            }),
          },
        ],
        statements,
      }),
    },
  ];

  const meta = handleMeta(plugin, operation, 'queryOptions');

  if (meta) {
    queryOptionsObj.push({
      key: 'meta',
      value: meta,
    });
  }

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: typeData,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: queryOptionsObj,
          }),
        }),
      ],
    }),
    name: identifierQueryOptions.name || '',
  });

  file.add(statement);

  return state;
};

const createMutationOptions = ({
  file,
  operation,
  plugin,
  queryFn,
  state,
}: {
  file: ReturnType<PluginInstance['createFile']>;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
  state: PluginState;
}) => {
  if (
    !plugin.config.mutationOptions ||
    !shouldGenerateMutation(operation, plugin)
  ) {
    return state;
  }

  if (!state.hasMutations) {
    state.hasMutations = true;
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ file, operation, plugin });

  const identifierMutationOptions = file.identifier({
    $ref: `#/pinia-colada-mutation-options/${operation.id}`,
    case: plugin.config.mutationOptions.case,
    create: true,
    nameTransformer: plugin.config.mutationOptions.name,
    namespace: 'value',
  });

  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: queryFn,
      parameters: ['options'],
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

  // Generate mutation options object for Pinia Colada
  const mutationOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'mutation',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          {
            name: 'options',
            type: typeData,
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

  const isRequiredOptionsForMutation = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptionsForMutation,
          name: 'options',
          type: typeData,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: mutationOptionsObj,
          }),
        }),
      ],
    }),
    name: identifierMutationOptions.name || '',
  });

  file.add(statement);

  return state;
};

export const handler: PluginHandler = ({ plugin }) => {
  const filesMap = new Map<string, ReturnType<typeof plugin.createFile>>();
  const stateMap = new Map<string, PluginState>();

  // Helper to get or create file for an operation
  const getFileForOperation = (operation: IR.OperationObject) => {
    if (!plugin.config.groupByTag) {
      // Single file mode
      const fileId = plugin.name;
      if (!filesMap.has(fileId)) {
        const file = plugin.createFile({
          case: plugin.config.case,
          id: fileId,
          path: plugin.output,
        });
        filesMap.set(fileId, file);
        stateMap.set(fileId, {
          hasMutations: false,
          hasQueries: false,
          hasUsedQueryFn: false,
        });
        // Import Options type from SDK
        file.import({
          ...clientApi.Options,
          module: file.relativePathToFile({
            context: plugin.context,
            id: sdkId,
          }),
        });
      }
      return { file: filesMap.get(fileId)!, state: stateMap.get(fileId)! };
    }

    // Group by tag mode
    const tag = operation.tags?.[0] || 'default';
    const fileId = `${plugin.name}/${tag}`;

    if (!filesMap.has(fileId)) {
      const file = plugin.createFile({
        case: plugin.config.case,
        id: fileId,
        path: `${plugin.output}/${tag}`,
      });
      filesMap.set(fileId, file);
      stateMap.set(fileId, {
        hasMutations: false,
        hasQueries: false,
        hasUsedQueryFn: false,
      });
      // Import Options type from SDK
      file.import({
        ...clientApi.Options,
        module: file.relativePathToFile({ context: plugin.context, id: sdkId }),
      });
    }
    return { file: filesMap.get(fileId)!, state: stateMap.get(fileId)! };
  };

  plugin.forEach(
    'operation',
    ({ operation }: { operation: IR.OperationObject }) => {
      const { file, state } = getFileForOperation(operation);
      state.hasUsedQueryFn = false;

      const sdkPlugin = plugin.getPlugin('@hey-api/sdk');
      const classes = sdkPlugin?.config.asClass
        ? operationClasses({
            context: plugin.context,
            operation,
            plugin: sdkPlugin,
          })
        : undefined;
      const entry = classes ? classes.values().next().value : undefined;
      const queryFn =
        // TODO: this should use class graph to determine correct path string
        // as it's really easy to break once we change the class casing
        (
          entry
            ? [
                entry.path[0],
                ...entry.path.slice(1).map((className: string) =>
                  stringCase({
                    case: 'camelCase',
                    value: className,
                  }),
                ),
                entry.methodName,
              ].filter(Boolean)
            : [
                serviceFunctionIdentifier({
                  config: plugin.context.config,
                  handleIllegal: true,
                  id: operation.id,
                  operation,
                }),
              ]
        ).join('.');

      createQueryOptions({
        file,
        operation,
        plugin,
        queryFn,
        state,
      });

      createMutationOptions({
        file,
        operation,
        plugin,
        queryFn,
        state,
      });

      if (state.hasUsedQueryFn) {
        file.import({
          module: file.relativePathToFile({
            context: plugin.context,
            id: sdkId,
          }),
          name: queryFn.split('.')[0]!,
        });
      }
    },
  );

  // Note: Client import removed as it's not currently used in the generated code
  // The SDK functions are called directly instead

  // If groupByTag is enabled, create an index file that re-exports all tag files
  if (plugin.config.groupByTag && plugin.config.exportFromIndex) {
    const indexFile = plugin.createFile({
      case: plugin.config.case,
      id: `${plugin.name}/index`,
      path: `${plugin.output}/index`,
    });

    filesMap.forEach((file, fileId) => {
      if (fileId !== plugin.name) {
        const tag = fileId.split('/').pop()!;
        indexFile.add(
          tsc.exportAllDeclaration({
            module: `./${tag}`,
          }),
        );
      }
    });
  }
};
