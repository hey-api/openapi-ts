import type ts from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { handleMeta } from './meta';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';
import {
  getPublicTypeData,
  useTypeData,
  useTypeError,
  useTypeResponse,
} from './utils';

const queryOptionsType = 'UseQueryOptions';
const optionsParamName = 'options';

export const createQueryOptions = ({
  file,
  operation,
  plugin,
  queryFn,
  state,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
  state: PluginState;
}): void => {
  if (
    !plugin.config.queryOptions.enabled ||
    !plugin.hooks.operation.isQuery(operation) ||
    hasOperationSse({ operation })
  ) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!state.hasQueries) {
    state.hasQueries = true;

    if (!state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ file, plugin });
      createQueryKeyFunction({ file, plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }

    file.import({
      asType: true,
      module: plugin.name,
      name: queryOptionsType,
    });
  }

  state.hasUsedQueryFn = true;

  const node = queryKeyStatement({
    file,
    operation,
    plugin,
  });
  file.add(node);

  const typeData = useTypeData({ file, operation, plugin });
  const typeError = useTypeError({ file, operation, plugin });
  const typeResponse = useTypeResponse({ file, operation, plugin });
  const { isNuxtClient, strippedTypeData } = getPublicTypeData({
    plugin,
    typeData,
  });

  const identifierQueryOptions = file.identifier({
    $ref: `#/pinia-colada-query-options/${operation.id}`,
    case: plugin.config.queryOptions.case,
    create: true,
    nameTransformer: plugin.config.queryOptions.name,
    namespace: 'value',
  });

  const fnOptions = 'context';

  const identifierQueryKey = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/pinia-colada-query-key/${operation.id}`,
    case: plugin.config.queryKeys.case,
    nameTransformer: plugin.config.queryKeys.name,
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
              spread: optionsParamName,
            },
            {
              spread: fnOptions,
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

  const queryOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'key',
      value: tsc.callExpression({
        functionName: identifierQueryKey.name || '',
        parameters: [optionsParamName],
      }),
    },
    {
      key: 'query',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          isNuxtClient
            ? {
                name: fnOptions,
                type: strippedTypeData,
              }
            : { name: fnOptions },
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
          name: optionsParamName,
          type: strippedTypeData,
        },
      ],
      returnType: isNuxtClient
        ? `${queryOptionsType}<${typeResponse}, ${strippedTypeData}, ${typeError.name}>`
        : `${queryOptionsType}<${typeResponse}, ${typeError.name}>`,
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
};
