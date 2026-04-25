import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
} from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { useTypeData, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

export function createSetQueryData({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void {
  if (hasOperationSse({ operation })) return;

  // setQueryData reuses the queryOptions function to get the queryKey,
  // mirroring how useQuery wraps queryOptions. This requires queryOptions
  // to also be enabled (referenceSymbol throws if it isn't).
  const symbolQueryOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'queryOptions',
    tool: plugin.name,
  });

  const symbolQueryClient = plugin.referenceSymbol({
    resource: `${plugin.name}.QueryClient`,
  });
  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  // updater: TResponse | undefined | ((old: TResponse | undefined) => TResponse | undefined)
  const responseOrUndefined = $.type.or(typeResponse, $.type('undefined'));
  const updaterType = $.type.or(
    typeResponse,
    $.type('undefined'),
    $.type
      .func()
      .param('old', (p) => p.type(responseOrUndefined))
      .returns(responseOrUndefined),
  );

  const symbolSetQueryData = plugin.symbol(applyNaming(operation.id, plugin.config.setQueryData), {
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'setQueryData',
      tool: plugin.name,
    },
  });

  const queryClientParam = 'queryClient';
  const optionsParam = 'options';
  const updaterParam = 'updater';

  const statement = $.const(symbolSetQueryData)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func()
        .param(queryClientParam, (p) => p.type($.type(symbolQueryClient)))
        .param(optionsParam, (p) => p.type(typeData))
        .param(updaterParam, (p) => p.type(updaterType))
        .do(
          $(queryClientParam)
            .attr('setQueryData')
            .call($(symbolQueryOptionsFn).call(optionsParam).attr('queryKey'), $(updaterParam))
            .return(),
        ),
    );
  plugin.node(statement);
}
