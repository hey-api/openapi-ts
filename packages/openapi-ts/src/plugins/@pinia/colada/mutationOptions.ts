import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';

import { handleMeta } from './meta';
import type { PiniaColadaPlugin } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';
import { getPublicTypeData } from './utils';

export const createMutationOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
}): void => {
  const symbolMutationOptionsType = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.UseMutationOptions`,
  });

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const { isNuxtClient, strippedTypeData } = getPublicTypeData({
    plugin,
    typeData,
  });
  // TODO: better types syntax
  const mutationType = isNuxtClient
    ? `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${strippedTypeData}, ${typeError}>`
    : `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${typeData}, ${typeError}>`;

  const fnOptions = 'fnOptions';

  const awaitSdkFn = $(queryFn)
    .call(
      $.object()
        .pretty()
        .spread('options')
        .spread(fnOptions)
        .prop('throwOnError', $.literal(true)),
    )
    .await();

  const statements: Array<ReturnType<typeof $.var | typeof $.return>> = [];

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  const mutationOpts = $.object()
    .pretty()
    .prop(
      'mutation',
      $.func()
        .async()
        .param(fnOptions, (p) =>
          p.$if(isNuxtClient, (f) => f.type(`Partial<${strippedTypeData}>`)),
        )
        .do(...statements),
    )
    .$if(handleMeta(plugin, operation, 'mutationOptions'), (o, v) =>
      o.prop('meta', v),
    );
  const symbolMutationOptions = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.mutationOptions,
      name: operation.id,
    }),
  });
  const statement = $.const(symbolMutationOptions.placeholder)
    .export(symbolMutationOptions.exported)
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) =>
      c.doc(v),
    )
    .assign(
      $.func()
        .param('options', (p) =>
          p.optional().type(`Partial<${strippedTypeData}>`),
        )
        .returns(mutationType)
        .do($.return(mutationOpts)),
    );
  plugin.setSymbolValue(symbolMutationOptions, statement);
};
