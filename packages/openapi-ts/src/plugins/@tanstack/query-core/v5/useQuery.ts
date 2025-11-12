import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';

import { useTypeData } from '../shared/useType';
import type { PluginInstance } from '../types';

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
  const statement = $.const(symbolUseQueryFn.placeholder)
    .export(symbolUseQueryFn.exported)
    .$if(
      plugin.config.comments && createOperationComment({ operation }),
      (c, v) => c.describe(v as ReadonlyArray<string>),
    )
    .assign(
      $.func()
        .param(optionsParamName, (p) =>
          p.optional(!isRequiredOptions).type(typeData),
        )
        .do(
          $(symbolUseQuery.placeholder)
            .call($(symbolQueryOptionsFn.placeholder).call(optionsParamName))
            .return(),
        ),
    );
  plugin.setSymbolValue(symbolUseQueryFn, statement);
};
