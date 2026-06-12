import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { createUseQueryParamsType } from '../shared/useQueryParams';
import type { PluginInstance } from '../types';

const optionsParamName = 'options';
const queryOptionsKey = 'queryOptions';
const sdkOptionsName = 'sdkOptions';

export function createUseQuery({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void {
  if (hasOperationSse({ operation })) return;

  if (!('useQuery' in plugin.config)) return;

  if (
    !plugin.querySymbol({
      category: 'utility',
      resource: 'UseQueryParams',
      tool: plugin.name,
    })
  ) {
    createUseQueryParamsType({ plugin });
  }

  const symbolUseQueryFn = plugin.symbol(applyNaming(operation.id, plugin.config.useQuery));

  const symbolUseQuery = plugin.symbols.useQuery;

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const symbolQueryOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'queryOptions',
    tool: plugin.name,
  });

  const symbolUseQueryParams = plugin.referenceSymbol({
    category: 'utility',
    resource: 'UseQueryParams',
    tool: plugin.name,
  });

  const mergedParamType = $.type(symbolUseQueryParams).generic($.type.query(symbolQueryOptionsFn));

  const func = $.func().param(optionsParamName, (p) =>
    p.required(isRequiredOptions).type(mergedParamType),
  );

  func.do(
    $.const()
      .object(queryOptionsKey)
      .spread(sdkOptionsName)
      .assign(isRequiredOptions ? $(optionsParamName) : $(optionsParamName).coalesce($.object())),
    $(symbolUseQuery)
      .call($.object().spread($(symbolQueryOptionsFn).call(sdkOptionsName)).spread(queryOptionsKey))
      .return(),
  );

  const statement = $.const(symbolUseQueryFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(func);
  plugin.node(statement);
}
