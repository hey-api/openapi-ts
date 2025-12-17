import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';

import { handleMeta } from './meta';
import type { PiniaColadaPlugin } from './types';
import { useTypeError, useTypeResponse } from './useType';
import { getPublicTypeData } from './utils';

export const createMutationOptions = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): void => {
  const symbolMutationOptionsType = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.UseMutationOptions`,
  });

  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const typeData = getPublicTypeData({ isNuxtClient, operation, plugin });

  const options = plugin.symbol('options');
  const fnOptions = plugin.symbol('vars');

  const awaitSdkFn = $.lazy((ctx) =>
    ctx
      .getAccess<ReturnType<typeof $>>(
        plugin.referenceSymbol({
          category: 'sdk',
          resource: 'operation',
          resourceId: operation.id,
        }),
      )
      .call(
        $.object()
          .pretty()
          .spread(options)
          .spread(fnOptions)
          .prop('throwOnError', $.literal(true)),
      )
      .await(),
  );

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
          p.$if(isNuxtClient, (f) =>
            f.type($.type('Partial').generic(typeData)),
          ),
        )
        .do(...statements),
    )
    .$if(handleMeta(plugin, operation, 'mutationOptions'), (o, v) =>
      o.prop('meta', v),
    );
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
        .param(options, (p) =>
          p.optional().type($.type('Partial').generic(typeData)),
        )
        .returns(
          $.type(symbolMutationOptionsType)
            .generic(useTypeResponse({ operation, plugin }))
            .generic(typeData)
            .generic(useTypeError({ operation, plugin })),
        )
        .do($.return(mutationOpts)),
    );
  plugin.node(statement);
};
