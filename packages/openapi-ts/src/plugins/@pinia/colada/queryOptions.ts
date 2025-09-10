import type ts from 'typescript';

import { hasOperationPathOrQueryAny } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
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
import { useTypeData } from './useType';
import { getPublicTypeData } from './utils';
const optionsParamName = 'options';

export const createQueryOptions = ({
  operation,
  plugin,
  queryFn,
  state,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
  state: PluginState;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const f = plugin.gen.ensureFile(plugin.output);
  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const hasAnyRequestFields = hasOperationPathOrQueryAny(operation);
  if (!state.hasQueries) {
    state.hasQueries = true;

    if (hasAnyRequestFields && !state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ plugin });
      createQueryKeyFunction({ plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }
  }

  const symbolUseQueryOptions = f.ensureSymbol({
    name: 'UseQueryOptions',
    selector: plugin.api.getSelector('UseQueryOptions'),
  });
  f.addImport({
    from: plugin.name,
    typeNames: [symbolUseQueryOptions.name],
  });
  f.addImport({ from: plugin.name, names: ['defineQueryOptions'] });

  state.hasUsedQueryFn = true;

  const symbolQueryKey = f.addSymbol({
    name: buildName({
      config: plugin.config.queryKeys,
      name: operation.id,
    }),
  });
  if (hasAnyRequestFields) {
    const node = queryKeyStatement({
      operation,
      plugin,
      symbol: symbolQueryKey,
    });
    symbolQueryKey.update({ value: node });
  }

  const typeData = useTypeData({ operation, plugin });
  const { strippedTypeData } = getPublicTypeData({
    plugin,
    typeData,
  });
  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: queryFn,
      parameters: [
        hasAnyRequestFields
          ? tsc.objectExpression({
              multiLine: true,
              obj: [
                ...(isRequiredOptions
                  ? ([{ spread: optionsParamName }] as const)
                  : []),
                { key: 'throwOnError', value: true },
              ],
            })
          : tsc.objectExpression({
              multiLine: false,
              obj: [{ key: 'throwOnError', value: true }],
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

  const queryOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'key',
      value: hasAnyRequestFields
        ? tsc.callExpression({
            functionName: symbolQueryKey.placeholder,
            parameters: [optionsParamName],
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

  const symbolQueryOptionsFn = f
    .ensureSymbol({
      selector: plugin.api.getSelector('queryOptionsFn', operation.id),
    })
    .update({
      name: buildName({
        config: plugin.config.queryOptions,
        name: operation.id,
      }),
    });
  const statement = tsc.constVariable({
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
    name: symbolQueryOptionsFn.placeholder,
  });

  symbolQueryOptionsFn.update({ value: statement });
};
