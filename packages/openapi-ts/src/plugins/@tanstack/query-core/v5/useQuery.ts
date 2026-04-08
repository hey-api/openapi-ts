import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { useTypeData } from '../shared/useType';
import type { PluginInstance } from '../types';

const optionsParamName = 'options';
const queryOptionsKey = 'queryOptions';
const sdkOptionsName = 'sdkOptions';

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

  const symbolUseQuery = plugin.external(`${plugin.name}.useQuery`);
  const symbolUseQueryFn = plugin.symbol(applyNaming(operation.id, plugin.config.useQuery));

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const typeData = useTypeData({ operation, plugin });

  const symbolSkipToken = $(plugin.external(`${plugin.name}.skipToken`));
  const sdkParamType = $.type.or(typeData, $.type.query(symbolSkipToken));

  const symbolQueryOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'queryOptions',
    tool: plugin.name,
  });

  const queryOptionsType = $.type('Partial').generic(
    $.type('Omit', (t) =>
      t.generics(
        $(symbolQueryOptionsFn).returnType(),
        $.type.or($.type.literal('queryKey'), $.type.literal('queryFn')),
      ),
    ),
  );

  const mergedParamType = $.type.and(
    sdkParamType,
    $.type.object().prop(queryOptionsKey, (p) => p.optional().type(queryOptionsType)),
  );

  const func = $.func().param(optionsParamName, (p) =>
    p.required(isRequiredOptions).type(mergedParamType),
  );

  func.do(
    $.if($(optionsParamName).eq(symbolSkipToken)).do(
      $(symbolUseQuery).call($(symbolQueryOptionsFn).call(optionsParamName)).return(),
    ),
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
};
