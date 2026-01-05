import type { IR } from '~/ir/types';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { applyNaming } from '~/utils/naming';

import { handleMeta } from '../shared/meta';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

export const createMutationOptions = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void => {
  const symbolMutationOptionsType = plugin.external(
    `${plugin.name}.MutationOptions`,
  );

  const typeData = useTypeData({ operation, plugin });
  const mutationType = $.type(symbolMutationOptionsType)
    .generic(useTypeResponse({ operation, plugin }))
    .generic(useTypeError({ operation, plugin }))
    .generic(typeData);

  const fnOptions = 'fnOptions';

  const awaitSdkFn = $.lazy((ctx) =>
    ctx
      .access(
        plugin.referenceSymbol({
          category: 'sdk',
          resource: 'operation',
          resourceId: operation.id,
        }),
      )
      .call(
        $.object()
          .spread('options')
          .spread(fnOptions)
          .prop('throwOnError', $.literal(true)),
      )
      .await(),
  );

  const statements: Array<TsDsl<any>> = [];
  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  const mutationOptionsFn = 'mutationOptions';
  const symbolMutationOptions = plugin.symbol(
    applyNaming(operation.id, plugin.config.mutationOptions),
  );
  const statement = $.const(symbolMutationOptions)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) =>
      c.doc(v),
    )
    .assign(
      $.func()
        .param('options', (p) =>
          p.optional().type($.type('Partial').generic(typeData)),
        )
        .returns(mutationType)
        .do(
          $.const(mutationOptionsFn)
            .type(mutationType)
            .assign(
              $.object()
                .pretty()
                .prop(
                  'mutationFn',
                  $.func()
                    .async()
                    .param(fnOptions)
                    .do(...statements),
                )
                .$if(handleMeta(plugin, operation, 'mutationOptions'), (c, v) =>
                  c.prop('meta', v),
                ),
            ),
          $(mutationOptionsFn).return(),
        ),
    );
  plugin.node(statement);
};
