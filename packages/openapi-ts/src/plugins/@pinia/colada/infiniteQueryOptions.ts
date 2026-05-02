import type { IR } from '@hey-api/shared';
import { applyNaming, operationPagination } from '@hey-api/shared';

import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../../plugins/shared/utils/operation';
import type { TsDsl } from '../../../ts-dsl';
import { $ } from '../../../ts-dsl';
import { handleMeta } from './meta';
import { createQueryKeyFunction, createQueryKeyType, queryKeyStatement } from './queryKey';
import type { PiniaColadaPlugin } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const createInfiniteParamsFunction = ({
  plugin,
}: {
  plugin: PiniaColadaPlugin['Instance'];
}): void => {
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
            $.type.or($.type.literal('body'), $.type.literal('path'), $.type.literal('query')),
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
  plugin: PiniaColadaPlugin['Instance'];
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
    !plugin.querySymbol({
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    })
  ) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  if (
    !plugin.querySymbol({
      category: 'utility',
      resource: 'createInfiniteParams',
      tool: plugin.name,
    })
  ) {
    createInfiniteParamsFunction({ plugin });
  }

  const symbolDefineInfiniteQueryOptions = plugin.external(
    `${plugin.name}.defineInfiniteQueryOptions`,
  );
  const symbolDefineInfiniteQueryOptionsType = plugin.external(
    `${plugin.name}.DefineInfiniteQueryOptions`,
  );

  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });

  const symbolQueryKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'QueryKey',
    tool: plugin.name,
  });
  const typeQueryKey = $.type(symbolQueryKeyType).generic(typeData);
  const typePageObjectParam = $.type('Pick').generics(
    typeQueryKey.idx(0),
    $.type.or($.type.literal('body'), $.type.literal('path'), $.type.literal('query')),
  );

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const paginationType = pluginTypeScript.api.schemaToType(pluginTypeScript, pagination.schema);
  const typePageParam = $.type.or(paginationType, typePageObjectParam);

  const typeInit = $.type('Pick').generics(
    $.type(symbolDefineInfiniteQueryOptionsType).generics(
      typeResponse,
      typeError,
      typePageParam,
      $.type('undefined'),
    ),
    $.type.or(
      $.type.literal('initialPageParam'),
      $.type.literal('getNextPageParam'),
      $.type.literal('maxPages'),
      $.type.literal('getPreviousPageParam'),
    ),
  );

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

  const symbolCreateInfiniteParams = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createInfiniteParams',
    tool: plugin.name,
  });

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

  const queryStatements: Array<TsDsl<any>> = [
    $.const('page')
      .type(typePageObjectParam)
      .assign(
        $.ternary($('pageParam').typeofExpr().eq($.literal('object')))
          .do('pageParam')
          .otherwise(
            $.object()
              .pretty()
              .prop(pagination.in, $.object().pretty().prop(pagination.name, $('pageParam'))),
          ),
      ),
    $.const('params').assign($(symbolCreateInfiniteParams).call('key', 'page')),
  ];

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    queryStatements.push($.return(awaitSdkFn));
  } else {
    queryStatements.push($.const().object('data').assign(awaitSdkFn), $.return('data'));
  }

  const queryFn = $.func()
    .async()
    .param((p) => p.object('pageParam', 'signal'))
    .do(...queryStatements);

  const optionsLiteral = $.object()
    .pretty()
    .prop('key', $('key'))
    .prop('query', queryFn)
    .$if(handleMeta(plugin, operation, 'infiniteQueryOptions'), (o, v) => o.prop('meta', v))
    .spread('init');

  const symbolInfiniteQueryOptionsFn = plugin.symbol(
    applyNaming(operation.id, plugin.config.infiniteQueryOptions),
    {
      meta: {
        category: 'hook',
        resource: 'operation',
        resourceId: operation.id,
        role: 'infiniteQueryOptions',
        tool: plugin.name,
      },
    },
  );

  const statement = $.const(symbolInfiniteQueryOptionsFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func()
        .param('options', (p) => p.required(isRequiredOptions).type(typeData))
        .param('init', (p) => p.type(typeInit))
        .do(
          $.const('key').assign($(symbolInfiniteQueryKey).call('options')),
          $.return($(symbolDefineInfiniteQueryOptions).call(optionsLiteral)),
        ),
    );
  plugin.node(statement);
};
