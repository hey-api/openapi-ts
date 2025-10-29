import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import { handleMeta } from './meta';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './useType';
import { getPublicTypeData } from './utils';

const optionsParamName = 'options';
const fnOptions = 'context';

export const createQueryOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  if (
    !plugin.getSymbol({
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    })
  ) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  let keyExpression: ts.Expression;
  if (plugin.config.queryKeys.enabled) {
    const symbolQueryKey = plugin.registerSymbol({
      exported: true,
      name: buildName({
        config: plugin.config.queryKeys,
        name: operation.id,
      }),
    });
    const node = queryKeyStatement({
      operation,
      plugin,
      symbol: symbolQueryKey,
    });
    plugin.setSymbolValue(symbolQueryKey, node);
    keyExpression = tsc.callExpression({
      functionName: symbolQueryKey.placeholder,
      parameters: [optionsParamName],
    });
  } else {
    const symbolCreateQueryKey = plugin.referenceSymbol({
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    });
    // Optionally include tags when configured
    let tagsExpr: ts.Expression | undefined;
    if (
      plugin.config.queryKeys.tags &&
      operation.tags &&
      operation.tags.length > 0
    ) {
      tagsExpr = tsc.arrayLiteralExpression({
        elements: operation.tags.map((t) => tsc.stringLiteral({ text: t })),
      });
    }
    keyExpression = tsc.callExpression({
      functionName: symbolCreateQueryKey.placeholder,
      parameters: [tsc.ots.string(operation.id), optionsParamName, tagsExpr],
    });
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
        tsc.objectExpression({
          multiLine: true,
          obj: [
            { spread: optionsParamName },
            { spread: fnOptions },
            { key: 'throwOnError', value: true },
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

  const queryOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'key',
      value: keyExpression,
    },
    {
      key: 'query',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [{ name: fnOptions }],
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

  const symbolQueryOptionsFn = plugin.registerSymbol({
    exported: true,
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'queryOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.queryOptions,
      name: operation.id,
    }),
  });
  const symbolDefineQueryOptions = plugin.registerSymbol({
    external: plugin.name,
    name: 'defineQueryOptions',
    selector: plugin.api.selector('defineQueryOptions'),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolQueryOptionsFn.exported,
    expression: tsc.callExpression({
      functionName: symbolDefineQueryOptions.placeholder,
      parameters: [
        tsc.arrowFunction({
          parameters: [
            {
              isRequired: isRequiredOptions,
              name: optionsParamName,
              type: strippedTypeData,
            },
          ],
          statements: tsc.objectExpression({ obj: queryOptionsObj }),
        }),
      ],
    }),
    name: symbolQueryOptionsFn.placeholder,
  });
  plugin.setSymbolValue(symbolQueryOptionsFn, statement);
};
