import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { handleMeta } from '../shared/meta';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

export const createMutationOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
}): void => {
  const symbolMutationOptionsType = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.MutationOptions`,
  });

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  // TODO: better types syntax
  const mutationType = `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${typeError}, ${typeData}>`;

  const fnOptions = 'fnOptions';

  const awaitSdkFn = $(queryFn)
    .call(
      $.object()
        .spread('options')
        .spread(fnOptions)
        .prop('throwOnError', $.literal(true)),
    )
    .await();

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
  const symbolMutationOptions = plugin.registerSymbol({
    name: buildName({
      config: plugin.config.mutationOptions,
      name: operation.id,
    }),
  });
  const statement = $.const(symbolMutationOptions)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) =>
      c.doc(v),
    )
    .assign(
      $.func()
        .param('options', (p) => p.optional().type(`Partial<${typeData}>`))
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
  plugin.setSymbolValue(symbolMutationOptions, statement);
};
