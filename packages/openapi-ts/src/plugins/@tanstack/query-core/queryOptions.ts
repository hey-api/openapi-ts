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
import type { PluginInstance, PluginState } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

export const createQueryOptions = ({
  operation,
  plugin,
  queryFn,
  state,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
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

  if (!state.hasQueries) {
    state.hasQueries = true;

    if (!state.hasCreateQueryKeyParamsFunction) {
      createQueryKeyType({ plugin });
      createQueryKeyFunction({ plugin });
      state.hasCreateQueryKeyParamsFunction = true;
    }
  }

  const symbolQueryOptions = f.ensureSymbol({
    name: 'queryOptions',
    selector: plugin.api.getSelector('queryOptions'),
  });
  f.addImport({
    from: plugin.name,
    names: [symbolQueryOptions.name],
  });

  state.hasUsedQueryFn = true;

  const symbolQueryKey = f.addSymbol({
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
  symbolQueryKey.update({ value: node });

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
    exportConst: plugin.config.queryOptions.exported,
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
  symbolQueryOptionsFn.update({ value: statement });
};
