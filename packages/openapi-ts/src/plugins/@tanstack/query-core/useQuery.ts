import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { PluginInstance, PluginState } from './types';
import { useTypeData } from './useType';

const optionsParamName = 'options';

export const createUseQuery = ({
  operation,
  plugin,
  state,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  state: PluginState;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  if (!('useQuery' in plugin.config)) {
    return;
  }

  const f = plugin.gen.ensureFile(plugin.output);

  const symbolUseQueryFn = f.addSymbol({
    name: buildName({
      config: plugin.config.useQuery,
      name: operation.id,
    }),
  });

  if (!state.hasUseQuery) {
    state.hasUseQuery = true;
  }

  const symbolUseQuery = f.ensureSymbol({
    name: 'useQuery',
    selector: plugin.api.getSelector('useQuery'),
  });
  f.addImport({
    from: plugin.name,
    names: [symbolUseQuery.name],
  });

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const typeData = useTypeData({ operation, plugin });

  const symbolQueryOptionsFn = f.ensureSymbol({
    selector: plugin.api.getSelector('queryOptionsFn', operation.id),
  });
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
  symbolUseQueryFn.update({ value: statement });
};
