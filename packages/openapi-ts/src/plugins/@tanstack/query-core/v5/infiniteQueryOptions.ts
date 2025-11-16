import { operationPagination } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
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

const createInfiniteParamsFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const symbolCreateInfiniteParams = plugin.registerSymbol({
    meta: {
      category: 'utility',
      resource: 'createInfiniteParams',
      tool: plugin.name,
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'createInfiniteParams',
    }),
  });

  const fn = $.const(symbolCreateInfiniteParams.placeholder).assign(
    $.func()
      .generic('K', (g) =>
        g.extends(
          "Pick<QueryKey<Options>[0], 'body' | 'headers' | 'path' | 'query'>",
        ),
      )
      .param('queryKey', (p) => p.type('QueryKey<Options>'))
      .param('page', (p) => p.type('K'))
      .do(
        $.const('params').assign($.object().spread($('queryKey').attr(0))),
        $.if($('page').attr('body')).do(
          $('params')
            .attr('body')
            .assign(
              $.object()
                .pretty()
                .spread($('queryKey').attr(0).attr('body').as('any'))
                .spread($('page').attr('body').as('any')),
            ),
        ),
        $.if($('page').attr('headers')).do(
          $('params')
            .attr('headers')
            .assign(
              $.object()
                .pretty()
                .spread($('queryKey').attr(0).attr('headers'))
                .spread($('page').attr('headers')),
            ),
        ),
        $.if($('page').attr('path')).do(
          $('params')
            .attr('path')
            .assign(
              $.object()
                .pretty()
                .spread($('queryKey').attr(0).attr('path').as('any'))
                .spread($('page').attr('path').as('any')),
            ),
        ),
        $.if($('page').attr('query')).do(
          $('params')
            .attr('query')
            .assign(
              $.object()
                .pretty()
                .spread($('queryKey').attr(0).attr('query').as('any'))
                .spread($('page').attr('query').as('any')),
            ),
        ),
        $.return($('params').as('unknown').as($('page').typeofType())),
      ),
  );
  plugin.setSymbolValue(symbolCreateInfiniteParams, fn);
};

export const createInfiniteQueryOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
}): void => {
  const pagination = operationPagination({
    context: plugin.context,
    operation,
  });

  if (!pagination) {
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

  if (
    !plugin.getSymbol({
      category: 'utility',
      resource: 'createInfiniteParams',
      tool: plugin.name,
    })
  ) {
    createInfiniteParamsFunction({ plugin });
  }

  const symbolInfiniteQueryOptions = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.infiniteQueryOptions`,
  });
  const symbolInfiniteDataType = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}.InfiniteData`,
  });

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  const symbolQueryKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'QueryKey',
    tool: plugin.name,
  });
  const typeQueryKey = `${symbolQueryKeyType.placeholder}<${typeData}>`;
  const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const type = pluginTypeScript.api.schemaToType({
    plugin: pluginTypeScript,
    schema: pagination.schema,
    state: {
      path: {
        value: [],
      },
    },
  });

  const symbolInfiniteQueryKey = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.infiniteQueryKeys,
      name: operation.id,
    }),
  });
  const node = queryKeyStatement({
    isInfinite: true,
    operation,
    plugin,
    symbol: symbolInfiniteQueryKey,
    typeQueryKey,
  });
  plugin.setSymbolValue(symbolInfiniteQueryKey, node);

  const awaitSdkFn = $(queryFn)
    .call(
      $.object()
        .spread('options')
        .spread('params')
        .prop('signal', $('signal'))
        .prop('throwOnError', $.literal(true)),
    )
    .await();

  const symbolCreateInfiniteParams = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createInfiniteParams',
    tool: plugin.name,
  });

  const statements: Array<TsDsl<any>> = [
    $.const('page')
      .type(typePageObjectParam)
      .hint('@ts-ignore')
      .assign(
        $.ternary($('pageParam').typeofExpr().eq($.literal('object')))
          .do('pageParam')
          .otherwise(
            $.object()
              .pretty()
              .prop(
                pagination.in,
                $.object().pretty().prop(pagination.name, $('pageParam')),
              ),
          ),
      ),
    $.const('params').assign(
      $(symbolCreateInfiniteParams.placeholder).call('queryKey', 'page'),
    ),
  ];

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  const symbolInfiniteQueryOptionsFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.infiniteQueryOptions,
      name: operation.id,
    }),
  });
  const statement = $.const(symbolInfiniteQueryOptionsFn.placeholder)
    .export(symbolInfiniteQueryOptionsFn.exported)
    .$if(
      plugin.config.comments && createOperationComment({ operation }),
      (c, v) => c.doc(v as ReadonlyArray<string>),
    )
    .assign(
      $.func()
        .param('options', (p) => p.optional(!isRequiredOptions).type(typeData))
        .do(
          $.return(
            $(symbolInfiniteQueryOptions.placeholder)
              .call(
                $.object()
                  .pretty()
                  .hint('@ts-ignore')
                  .prop(
                    'queryFn',
                    $.func()
                      .async()
                      .param((p) => p.object('pageParam', 'queryKey', 'signal'))
                      .do(...statements),
                  )
                  .prop(
                    'queryKey',
                    $(symbolInfiniteQueryKey.placeholder).call('options'),
                  )
                  .$if(
                    handleMeta(plugin, operation, 'infiniteQueryOptions'),
                    (o, v) => o.prop('meta', $(v)),
                  ),
              )
              .generics(
                // TODO: better types syntax
                typeResponse,
                typeError || 'unknown',
                `${symbolInfiniteDataType.placeholder}<${typeResponse}>`,
                typeQueryKey,
                $.type.or(type, typePageObjectParam),
              ),
          ),
        ),
    );
  plugin.setSymbolValue(symbolInfiniteQueryOptionsFn, statement);
};
