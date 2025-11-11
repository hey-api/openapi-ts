import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from '../queryKey';
import { handleMeta } from '../shared/meta';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

const optionsParamName = 'options';

export const createQueryOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
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

  const symbolQueryOptions = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.queryOptions`,
  });

  const symbolQueryKey = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.queryKeys,
      name: operation.id,
    }),
  });
  const node = queryKeyStatement({
    isInfinite: false,
    operation,
    plugin,
    symbol: symbolQueryKey,
  });
  plugin.setSymbolValue(symbolQueryKey, node);

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const queryKeyReturnType = `ReturnType<typeof ${symbolQueryKey.placeholder}>`;
  const statements: Array<TsDsl<any>> = [
    $.const()
      .array(['queryParams'])
      .assign($(`queryKey as ${queryKeyReturnType}`)),
  ];

  const awaitSdkFn = $(queryFn)
    .call(
      $.object()
        .spread(optionsParamName)
        .spread('queryParams')
        .prop('signal', $('signal'))
        .prop('throwOnError', $.literal(true)),
    )
    .await();

  const queryOptionsGenerics = [
    typeResponse,
    typeError || 'unknown',
    typeResponse,
    queryKeyReturnType,
  ].join(', ');

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  const queryOptionsObj = $.object()
    .pretty()
    .prop(
      'queryFn',
      $.func()
        .async()
        .param((p) => p.object('queryKey', 'signal'))
        .do(...statements),
    )
    .prop('queryKey', $(symbolQueryKey.placeholder).call(optionsParamName))
    .$if(handleMeta(plugin, operation, 'queryOptions'), (o, v) =>
      o.prop('meta', $(v)),
    );

  const symbolQueryOptionsFn = plugin.registerSymbol({
    exported: plugin.config.queryOptions.exported,
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
  const statement = $.const(symbolQueryOptionsFn.placeholder)
    .export(symbolQueryOptionsFn.exported)
    .$if(
      plugin.config.comments && createOperationComment({ operation }),
      (c, v) => c.describe(v as Array<string>),
    )
    .assign(
      $.func()
        .param(optionsParamName, (p) =>
          p.optional(!isRequiredOptions).type(typeData),
        )
        .do(
          $(`${symbolQueryOptions.placeholder}<${queryOptionsGenerics}>`)
            .call(queryOptionsObj)
            .return(),
        ),
    );
  plugin.setSymbolValue(symbolQueryOptionsFn, statement);
};
