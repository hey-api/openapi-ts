import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import {
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { handleMeta } from './meta';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

export const createQueryOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!plugin.getSymbol(plugin.api.selector('createQueryKey'))) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  const symbolQueryOptions = plugin.referenceSymbol(
    plugin.api.selector('queryOptions'),
  );

  const symbolQueryKey = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.queryKeys,
      name: operation.id,
    }),
  });
  const node = queryKeyStatement({
    isInfinite: false,
    operation,
    plugin,
    symbol: symbolQueryKey,
  });
  plugin.setSymbolValue(symbolQueryKey, node);

  const typeData = useTypeData({ operation, plugin });

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
              spread: 'queryKey[0]',
            },
            {
              key: 'signal',
              shorthand: true,
              value: tsc.identifier({
                text: 'signal',
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
      key: 'queryFn',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          {
            destructure: [
              {
                name: 'queryKey',
              },
              {
                name: 'signal',
              },
            ],
          },
        ],
        statements,
      }),
    },
    {
      key: 'queryKey',
      value: tsc.callExpression({
        functionName: symbolQueryKey.placeholder,
        parameters: [optionsParamName],
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

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  const symbolQueryOptionsFn = plugin.registerSymbol({
    exported: plugin.config.queryOptions.exported,
    name: buildName({
      config: plugin.config.queryOptions,
      name: operation.id,
    }),
    selector: plugin.api.selector('queryOptionsFn', operation.id),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? sdkPlugin.api.createOperationComment({ operation })
      : undefined,
    exportConst: symbolQueryOptionsFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: optionsParamName,
          type: typeData,
        },
      ],
      statements: [
        tsc.returnFunctionCall({
          args: [tsc.objectExpression({ obj: queryOptionsObj })],
          name: symbolQueryOptions.placeholder,
        }),
      ],
    }),
    name: symbolQueryOptionsFn.placeholder,
    // TODO: add type error
    // TODO: AxiosError<PutSubmissionMetaError>
  });
  plugin.setSymbolValue(symbolQueryOptionsFn, statement);
};
