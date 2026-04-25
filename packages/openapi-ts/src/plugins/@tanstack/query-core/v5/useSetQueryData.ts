import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
} from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { useTypeData, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

export function createUseSetQueryData({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void {
  if (hasOperationSse({ operation })) return;

  if (!('useSetQueryData' in plugin.config)) return;

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

  const symbolUseSetQueryData = plugin.symbol(
    applyNaming(operation.id, plugin.config.useSetQueryData),
    {
      meta: {
        category: 'hook',
        resource: 'operation',
        resourceId: operation.id,
        role: 'useSetQueryData',
        tool: plugin.name,
      },
    },
  );

  const queryClientVar = 'queryClient';
  const optionsParam = 'options';
  const updaterParam = 'updater';

  const statement = $.const(symbolUseSetQueryData)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func().do(
        $.const(queryClientVar).assign($(symbolUseQueryClient).call()),
        $.return(
          $.func()
            .param(optionsParam, (p) => p.type(typeData))
            .param(updaterParam, (p) => p.type(updaterType))
            .do(
              $(queryClientVar)
                .attr('setQueryData')
                .call($(symbolQueryOptionsFn).call(optionsParam).attr('queryKey'), $(updaterParam))
                .return(),
            ),
        ),
      ),
    );
  plugin.node(statement);
}
