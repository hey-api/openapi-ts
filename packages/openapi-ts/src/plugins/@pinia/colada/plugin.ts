import type ts from 'typescript';

import { clientApi } from '../../../generate/client';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { clientId } from '../../@hey-api/client-core/utils';
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
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const pluginSdk = plugin.getPlugin('@hey-api/sdk')!;
  const typeData = operationOptionsType({ file, operation, plugin: pluginSdk });
  return typeData;
};

const createQueryOptions = ({
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
    !plugin.config.queryOptions ||
    !(['get', 'post'] as ReadonlyArray<typeof operation.method>).includes(
      operation.method,
    )
  ) {
    return state;
  }

  const file = plugin.context.file({ id: plugin.name })!;
  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!state.hasQueries) {
    state.hasQueries = true;
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ operation, plugin });

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
    !plugin.config.mutationOptions ||
    (['get'] as ReadonlyArray<typeof operation.method>).includes(
      operation.method,
    )
  ) {
    return state;
  }

  const file = plugin.context.file({ id: plugin.name })!;

  if (!state.hasMutations) {
    state.hasMutations = true;
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ operation, plugin });

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

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: false,
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
  const file = plugin.createFile({
    case: plugin.config.case,
    id: plugin.name,
    path: plugin.output,
  });

  const state: PluginState = {
    hasMutations: false,
    hasQueries: false,
    hasUsedQueryFn: false,
  };

  // Import Options type from SDK
  file.import({
    ...clientApi.Options,
    module: file.relativePathToFile({ context: plugin.context, id: sdkId }),
  });

  plugin.forEach(
    'operation',
    ({ operation }: { operation: IR.OperationObject }) => {
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
        operation,
        plugin,
        queryFn,
        state,
      });

      createMutationOptions({
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

  if (state.hasQueries || state.hasMutations) {
    file.import({
      alias: '_heyApiClient',
      module: file.relativePathToFile({
        context: plugin.context,
        id: clientId,
      }),
      name: 'client',
    });
  }
};
