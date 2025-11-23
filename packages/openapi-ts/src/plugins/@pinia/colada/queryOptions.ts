import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';

import { handleMeta } from './meta';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './useType';
import { getPublicTypeData } from './utils';

const optionsParamName = 'options';
const fnOptions = 'context';

export const createQueryOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
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
    const symbolQueryKey = plugin.registerSymbol({
      name: buildName({
        config: plugin.config.queryKeys,
        name: operation.id,
      }),
    });
    const node = queryKeyStatement({
      operation,
      plugin,
      symbol: symbolQueryKey,
    });
    plugin.setSymbolValue(symbolQueryKey, node);
    keyExpression = $(symbolQueryKey.placeholder).call(optionsParamName);
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
    keyExpression = $(symbolCreateQueryKey.placeholder).call(
      $.literal(operation.id),
      optionsParamName,
      tagsExpr,
    );
  }

  const typeData = useTypeData({ operation, plugin });
  const { strippedTypeData } = getPublicTypeData({
    plugin,
    typeData,
  });
  const awaitSdkFn = $(queryFn)
    .call(
      $.object()
        .spread(optionsParamName)
        .spread(fnOptions)
        .prop('throwOnError', $.literal(true)),
    )
    .await();

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

  const symbolQueryOptionsFn = plugin.registerSymbol({
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'queryOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.queryOptions,
      name: operation.id,
    }),
  });
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
      $(symbolDefineQueryOptions.placeholder).call(
        $.func()
          .param(optionsParamName, (p) =>
            p.required(isRequiredOptions).type(strippedTypeData),
          )
          .do($.return(queryOpts)),
      ),
    );
  plugin.setSymbolValue(symbolQueryOptionsFn, statement);
};
