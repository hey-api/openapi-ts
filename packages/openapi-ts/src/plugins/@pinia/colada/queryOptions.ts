import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { applyNaming } from '~/utils/naming';

import { handleMeta } from './meta';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PiniaColadaPlugin } from './types';
import { getPublicTypeData } from './utils';

const optionsParamName = 'options';
const fnOptions = 'context';

export const createQueryOptions = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  if (
    !plugin.getSymbol({
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    })
  ) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  let keyExpression: ReturnType<typeof $.call>;
  if (plugin.config.queryKeys.enabled) {
    const symbolQueryKey = plugin.symbol(
      applyNaming(operation.id, plugin.config.queryKeys),
    );
    const node = queryKeyStatement({
      operation,
      plugin,
      symbol: symbolQueryKey,
    });
    plugin.node(node);
    keyExpression = $(symbolQueryKey).call(optionsParamName);
  } else {
    const symbolCreateQueryKey = plugin.referenceSymbol({
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    });
    // Optionally include tags when configured
    let tagsExpr: ReturnType<typeof $.array> | undefined;
    if (
      plugin.config.queryKeys.tags &&
      operation.tags &&
      operation.tags.length > 0
    ) {
      tagsExpr = $.array(...operation.tags.map((t) => $.literal(t)));
    }
    keyExpression = $(symbolCreateQueryKey).call(
      $.literal(operation.id),
      optionsParamName,
      tagsExpr,
    );
  }

  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const typeData = getPublicTypeData({ isNuxtClient, operation, plugin });
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
          .spread(optionsParamName)
          .spread(fnOptions)
          .prop('throwOnError', $.literal(true)),
      )
      .await(),
  );

  const statements: Array<ReturnType<typeof $.return | typeof $.const>> = [];
  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  const queryOpts = $.object()
    .pretty()
    .prop('key', keyExpression)
    .prop(
      'query',
      $.func()
        .async()
        .param(fnOptions)
        .do(...statements),
    )
    .$if(handleMeta(plugin, operation, 'queryOptions'), (o, v) =>
      o.prop('meta', v),
    );

  const symbolQueryOptionsFn = plugin.symbol(
    applyNaming(operation.id, plugin.config.queryOptions),
    {
      meta: {
        category: 'hook',
        resource: 'operation',
        resourceId: operation.id,
        role: 'queryOptions',
        tool: plugin.name,
      },
    },
  );
  const symbolDefineQueryOptions = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.defineQueryOptions`,
  });
  const statement = $.const(symbolQueryOptionsFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) =>
      c.doc(v),
    )
    .assign(
      $(symbolDefineQueryOptions).call(
        $.func()
          .param(optionsParamName, (p) =>
            p.required(isRequiredOptions).type(typeData),
          )
          .do($.return(queryOpts)),
      ),
    );
  plugin.node(statement);
};
