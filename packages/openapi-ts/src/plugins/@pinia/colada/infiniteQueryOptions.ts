import type { IR } from '@hey-api/shared';
import { applyNaming, operationPagination } from '@hey-api/shared';
import ts from 'typescript';

import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../../plugins/shared/utils/operation';
import type { TsDsl, TypeTsDsl } from '../../../ts-dsl';
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

  const sdkParamsReturnType = $.type('Pick').generics(
    'TData',
    $.type.or($.type.literal('body'), $.type.literal('path'), $.type.literal('query')),
  );
  const fn = $.const(symbolCreateInfiniteParams).assign(
    $.func()
      .generic('TData', (g) => g.extends('Options'))
      .generic('K', (g) =>
        g.extends(
          $.type
            .object()
            .prop('body', (p) => p.optional().type('unknown'))
            .prop('path', (p) => p.optional().type('unknown'))
            .prop('query', (p) => p.optional().type('unknown')),
        ),
      )
      .param('queryKey', (p) => p.type('QueryKey<TData>'))
      .param('page', (p) => p.type('K'))
      .returns(sdkParamsReturnType)
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
        $.return($('params').as('unknown').as(sdkParamsReturnType)),
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
  const typePageObjectParam = $.type
    .object()
    .prop('body', (p) =>
      p.optional().type($.type('Partial').generic($.type.idx(typeData, $.type.literal('body')))),
    )
    .prop('path', (p) =>
      p.optional().type($.type('Partial').generic($.type.idx(typeData, $.type.literal('path')))),
    )
    .prop('query', (p) =>
      p.optional().type($.type('Partial').generic($.type.idx(typeData, $.type.literal('query')))),
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

  const paginationTypeRef = paginationType as TypeTsDsl;
  const buildNestedPageObject = (parts: ReadonlyArray<string>): ReturnType<typeof $.object> => {
    const [first, ...rest] = parts;
    return $.object()
      .pretty()
      .prop(
        first!,
        rest.length ? buildNestedPageObject(rest) : $('pageParam').as(paginationTypeRef),
      );
  };

  const hasKey = (key: string) => $.binary($.literal(key), ts.SyntaxKind.InKeyword, $('pageParam'));
  const isPageObjectCondition = $.binary(
    $.binary(
      $('pageParam').typeofExpr().eq($.literal('object')),
      '&&',
      $('pageParam').neq($.literal(null)),
    ),
    '&&',
    $.binary($.binary(hasKey('body'), '||', hasKey('path')), '||', hasKey('query')),
  );

  const paginationParts = pagination.name.split('.');
  const otherwiseLiteralBase = $.object()
    .pretty()
    .prop(pagination.in, buildNestedPageObject(paginationParts));
  // For nested pagination paths (e.g. `foo.page` where `foo` is a required object
  // with required siblings of its own), the runtime override only fills the leaf
  // pagination key. The inline deep-partial type makes top-level body/path/query
  // optional and their direct children optional, but stops there — nested objects
  // keep their original required shape. Cast through `unknown` so the literal
  // assigns to the override type; `createInfiniteParams` merges with the queryKey
  // snapshot at runtime to restore the full shape for the SDK call.
  const otherwiseLiteral =
    paginationParts.length > 1
      ? otherwiseLiteralBase.as('unknown').as(typePageObjectParam)
      : otherwiseLiteralBase;
  const queryStatements: Array<TsDsl<any>> = [
    $.const('page')
      .type(typePageObjectParam)
      .assign($.ternary(isPageObjectCondition).do('pageParam').otherwise(otherwiseLiteral)),
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
        .param('options', (p) => {
          p.type(typeData);
          if (!isRequiredOptions) {
            p.assign($.object());
          }
        })
        .param('init', (p) => p.type(typeInit))
        .do(
          $.const('key').assign($(symbolInfiniteQueryKey).call('options')),
          $.return($(symbolDefineInfiniteQueryOptions).call(optionsLiteral)),
        ),
    );
  plugin.node(statement);
};
