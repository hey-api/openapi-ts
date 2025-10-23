import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import {
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
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

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  const symbolUseQueryFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.useQuery,
      name: operation.id,
    }),
  });

  const symbolUseQuery = plugin.referenceSymbol(
    plugin.api.selector('useQuery'),
  );

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const typeData = useTypeData({ operation, plugin });

  const symbolQueryOptionsFn = plugin.referenceSymbol(
    plugin.api.selector('queryOptionsFn', operation.id),
  );
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? sdkPlugin.api.createOperationComment({ operation })
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
