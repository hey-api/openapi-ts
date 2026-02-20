import { ref } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming, operationPagination } from '@hey-api/shared';

import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../../../plugins/shared/utils/operation';
import type { TsDsl } from '../../../../ts-dsl';
import { $ } from '../../../../ts-dsl';
import {
  createQueryKeyFunction,
  createQueryKeyOptionsType,
  createQueryKeyType,
  queryKeyStatement,
} from '../queryKey';
import { handleMeta } from '../shared/meta';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

const createInfiniteParamsFunction = ({ plugin }: { plugin: PluginInstance }) => {
  const symbolCreateInfiniteParams = plugin.symbol(
    applyNaming('createInfiniteParams', {
      case: plugin.config.case,
    }),
    {
      meta: {
        category: 'utility',
        resource: 'createInfiniteParams',
        tool: plugin.name,
      },
    },
  );

  const fn = $.const(symbolCreateInfiniteParams).assign(
    $.func()
      .generic('K', (g) =>
        g.extends(
          $.type('Pick').generics(
            $.type('QueryKey').generic('Options').idx(0),
            $.type.or(
              $.type.literal('body'),
              $.type.literal('headers'),
              $.type.literal('path'),
              $.type.literal('query'),
            ),
          ),
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
  plugin.node(fn);
};

export const createInfiniteQueryOptions = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
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
    createQueryKeyOptionsType({ plugin });
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

  const symbolInfiniteQueryOptions = plugin.external(`${plugin.name}.infiniteQueryOptions`);
  const symbolInfiniteDataType = plugin.external(`${plugin.name}.InfiniteData`);

  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  const symbolQueryKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'QueryKey',
    tool: plugin.name,
  });
  const typeQueryKey = $.type(symbolQueryKeyType).generic(typeData);
  const typePageObjectParam = $.type('Pick').generics(
    typeQueryKey.idx(0),
    $.type.or(
      $.type.literal('body'),
      $.type.literal('headers'),
      $.type.literal('path'),
      $.type.literal('query'),
    ),
  );
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const type = pluginTypeScript.api.schemaToType({
    plugin: pluginTypeScript,
    schema: pagination.schema,
    state: {
      path: ref([]),
    },
  });

  const symbolInfiniteQueryKey = plugin.symbol(
    applyNaming(operation.id, plugin.config.infiniteQueryKeys),
  );
  const node = queryKeyStatement({
    isInfinite: true,
    operation,
    plugin,
    symbol: symbolInfiniteQueryKey,
    typeQueryKey,
  });
  plugin.node(node);

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
          .spread('params')
          .prop('signal', $('signal'))
          .prop('throwOnError', $.literal(true)),
      )
      .await(),
  );

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
              .prop(pagination.in, $.object().pretty().prop(pagination.name, $('pageParam'))),
          ),
      ),
    $.const('params').assign($(symbolCreateInfiniteParams).call('queryKey', 'page')),
  ];

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push($.const().object('data').assign(awaitSdkFn), $.return('data'));
  }

  const symbolInfiniteQueryOptionsFn = plugin.symbol(
    applyNaming(operation.id, plugin.config.infiniteQueryOptions),
  );
  const statement = $.const(symbolInfiniteQueryOptionsFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func()
        .param('options', (p) => p.required(isRequiredOptions).type(typeData))
        .do(
          $.return(
            $(symbolInfiniteQueryOptions)
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
                  .prop('queryKey', $(symbolInfiniteQueryKey).call('options'))
                  .$if(handleMeta(plugin, operation, 'infiniteQueryOptions'), (o, v) =>
                    o.prop('meta', v),
                  ),
              )
              .generics(
                typeResponse,
                useTypeError({ operation, plugin }),
                $.type(symbolInfiniteDataType).generic(typeResponse),
                typeQueryKey,
                $.type.or(type, typePageObjectParam),
              ),
          ),
        ),
    );
  plugin.node(statement);
};
