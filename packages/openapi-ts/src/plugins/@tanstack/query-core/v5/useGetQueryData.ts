import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { useTypeData, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

export function createUseGetQueryData({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void {
  if (hasOperationSse({ operation })) return;

  if (!('useGetQueryData' in plugin.config)) return;

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const symbolUseQueryClient = plugin.external(`${plugin.name}.useQueryClient`);
  const symbolQueryOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'queryOptions',
    tool: plugin.name,
  });

  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  const symbolUseGetQueryData = plugin.symbol(
    applyNaming(operation.id, plugin.config.useGetQueryData),
    {
      meta: {
        category: 'hook',
        resource: 'operation',
        resourceId: operation.id,
        role: 'useGetQueryData',
        tool: plugin.name,
      },
    },
  );

  const queryClientVar = 'queryClient';
  const optionsParam = 'options';

  const optionsType = isRequiredOptions ? typeData : $.type.or(typeData, $.type('undefined'));

  const statement = $.const(symbolUseGetQueryData)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func().do(
        $.const(queryClientVar).assign($(symbolUseQueryClient).call()),
        $.return(
          $.func()
            .param(optionsParam, (p) => p.type(optionsType))
            .do(
              $(queryClientVar)
                .attr('getQueryData')
                .call($(symbolQueryOptionsFn).call(optionsParam).attr('queryKey'))
                .generic(typeResponse)
                .return(),
            ),
        ),
      ),
    );
  plugin.node(statement);
}
