import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import type { PluginInstance } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

export const createUseQuery = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  if (!('useQuery' in plugin.config)) {
    return;
  }

  const symbolUseQueryFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.useQuery,
      name: operation.id,
    }),
  });

  const symbolUseQuery = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.useQuery`,
  });

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const typeData = useTypeData({ operation, plugin });

  const symbolQueryOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'queryOptions',
    tool: plugin.name,
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolUseQueryFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: optionsParamName,
          type: typeData,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: tsc.callExpression({
            functionName: symbolUseQuery.placeholder,
            parameters: [
              tsc.callExpression({
                functionName: symbolQueryOptionsFn.placeholder,
                parameters: [optionsParamName],
              }),
            ],
          }),
        }),
      ],
    }),
    name: symbolUseQueryFn.placeholder,
  });
  plugin.setSymbolValue(symbolUseQueryFn, statement);
};
