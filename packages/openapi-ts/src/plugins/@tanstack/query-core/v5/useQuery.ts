import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

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

  const symbolUseQueryFn = plugin.symbol(
    applyNaming(operation.id, plugin.config.useQuery),
  );

  const symbolUseQuery = plugin.external(`${plugin.name}.useQuery`);

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
  const statement = $.const(symbolUseQueryFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) =>
      c.doc(v),
    )
    .assign(
      $.func()
        .param(optionsParamName, (p) =>
          p.required(isRequiredOptions).type(typeData),
        )
        .do(
          $(symbolUseQuery)
            .call($(symbolQueryOptionsFn).call(optionsParamName))
            .return(),
        ),
    );
  plugin.node(statement);
};
