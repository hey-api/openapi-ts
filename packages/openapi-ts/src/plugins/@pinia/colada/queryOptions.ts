import type ts from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import {
  hasOperationDataRequired,
  hasOperationPathOrQueryAny,
} from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  hasOperationSse,
} from '../../shared/utils/operation';
import { handleMeta } from './meta';
import { createQueryKeyFunction, createQueryKeyType } from './queryKey';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';
import { getPublicTypeData, useTypeData } from './utils';

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

  if (!state.hasQueries) {
    state.hasQueries = true;
    file.import({
      module: '@pinia/colada',
      name: 'defineQueryOptions',
    });
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ file, operation, plugin });
  const { strippedTypeData } = getPublicTypeData({ plugin, typeData });

  const hasAnyRequestFields = hasOperationPathOrQueryAny(operation);
  if (hasAnyRequestFields && !state.hasCreateQueryKeyParamsFunction) {
    createQueryKeyType({ file, plugin });
    createQueryKeyFunction({ file, plugin });

    state.hasCreateQueryKeyParamsFunction = true;
  }

  const identifierCreateQueryKey = file.identifier({
    $ref: '#/pinia-colada-create-query-key/createQueryKey',
    case: plugin.config.case,
    create: true,
    namespace: 'value',
  });

  let tagsExpression: ts.Expression | undefined;
  if (
    plugin.config.queryKeys.tags &&
    operation.tags &&
    operation.tags.length > 0
  ) {
    tagsExpression = tsc.arrayLiteralExpression({
      elements: operation.tags.map((tag) => tsc.stringLiteral({ text: tag })),
    });
  }

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
        hasAnyRequestFields
          ? tsc.objectExpression({
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
            })
          : tsc.objectExpression({
              multiLine: false,
              obj: [
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
      value: hasAnyRequestFields
        ? tsc.callExpression({
            functionName: identifierCreateQueryKey.name || '',
            parameters: [
              tsc.ots.string(operation.id),
              optionsParamName,
              tagsExpression,
            ].filter(Boolean) as Array<string | ts.Expression>,
          })
        : tsc.arrayLiteralExpression({
            elements: [tsc.ots.string(operation.id)],
          }),
    },
    {
      key: 'query',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [],
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

  const isRequiredOptions = hasOperationDataRequired(operation);
  const exportedDefineQuery = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.callExpression({
      functionName: 'defineQueryOptions',
      parameters: [
        hasAnyRequestFields
          ? tsc.arrowFunction({
              parameters: [
                {
                  isRequired: isRequiredOptions,
                  name: optionsParamName,
                  type: strippedTypeData,
                },
              ],
              statements: tsc.objectExpression({ obj: queryOptionsObj }),
            })
          : tsc.objectExpression({ obj: queryOptionsObj }),
      ],
    }),
    name: identifierQueryOptions.name || '',
  });

  file.add(exportedDefineQuery);
};
