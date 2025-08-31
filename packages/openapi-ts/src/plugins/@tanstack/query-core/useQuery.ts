import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { PluginInstance, PluginState } from './types';
import { useTypeData } from './useType';

const useQueryFn = 'useQuery';
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

  const file = plugin.context.file({ id: plugin.name })!;

  if (!state.hasUseQuery) {
    state.hasUseQuery = true;

    file.import({
      module: plugin.name,
      name: useQueryFn,
    });
  }

  const identifierUseQuery = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-use-query/${operation.id}`,
    case: 'useQuery' in plugin.config ? plugin.config.useQuery.case : undefined,
    create: true,
    nameTransformer:
      'useQuery' in plugin.config ? plugin.config.useQuery.name : undefined,
    namespace: 'value',
  });

  const identifierQueryOptions = file.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/tanstack-query-query-options/${operation.id}`,
    case: plugin.config.queryOptions.case,
    nameTransformer: plugin.config.queryOptions.name,
    namespace: 'value',
  });

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const typeData = useTypeData({ operation, plugin });

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
            functionName: useQueryFn,
            parameters: [
              tsc.callExpression({
                functionName: identifierQueryOptions.name || '',
                parameters: [optionsParamName],
              }),
            ],
          }),
        }),
      ],
    }),
    name: identifierUseQuery.name || '',
  });
  file.add(statement);
};
