import type ts from 'typescript';

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
import type { PiniaColadaPlugin } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';
import { getPublicTypeData } from './utils';

const fnOptions = 'context';
const optionsParamName = 'options';

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

  if (!plugin.getSymbol(plugin.api.getSelector('createQueryKey'))) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  const symbolUseQueryOptions = plugin.referenceSymbol(
    plugin.api.getSelector('UseQueryOptions'),
  );

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

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const { isNuxtClient, strippedTypeData } = getPublicTypeData({
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
      value: tsc.callExpression({
        functionName: symbolQueryKey.placeholder,
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

  const symbolQueryOptionsFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.queryOptions,
      name: operation.id,
    }),
    selector: plugin.api.getSelector('queryOptionsFn', operation.id),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolQueryOptionsFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: optionsParamName,
          type: strippedTypeData,
        },
      ],
      // TODO: better types syntax
      returnType: isNuxtClient
        ? `${symbolUseQueryOptions.placeholder}<${typeResponse}, ${strippedTypeData}, ${typeError}>`
        : `${symbolUseQueryOptions.placeholder}<${typeResponse}, ${typeError}>`,
      statements: [
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: queryOptionsObj,
          }),
        }),
      ],
    }),
    name: symbolQueryOptionsFn.placeholder,
  });
  plugin.setSymbolValue(symbolQueryOptionsFn, statement);
};
