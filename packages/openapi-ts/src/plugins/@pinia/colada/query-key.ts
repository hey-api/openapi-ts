import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming, hasOperationDataRequired } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import { $ } from '../../../ts-dsl';
import { getClientBaseUrlKey, getClientPlugin } from '../../@hey-api/client-core/utils';
import type { PiniaColadaPlugin } from './types';
import { getPublicTypeData } from './utils';

const TOptionsType = 'TOptions';

export const createQueryKeyFunction = ({ plugin }: { plugin: PiniaColadaPlugin['Instance'] }) => {
  const symbolCreateQueryKey = plugin.symbol(
    applyNaming('createQueryKey', {
      case: plugin.config.case,
    }),
    {
      meta: {
        category: 'utility',
        resource: 'createQueryKey',
      },
    },
  );
  // TODO: contract (self)
  const symbolQueryKeyType = plugin.referenceSymbol({
    artifact: '@pinia/colada',
    category: 'type',
    resource: 'QueryKey',
  });

  const returnType = $.type(symbolQueryKeyType).generic(TOptionsType).idx(0);

  const baseUrlKey = getClientBaseUrlKey(getTypedConfig(plugin));
  // TODO: contract (cross)
  const symbolOptions = plugin.referenceSymbol({
    artifact: 'sdk',
    category: 'type',
    resource: 'client-options',
  });
  // TODO: contract (?)
  const symbolClient = plugin.querySymbol({
    category: 'client',
  });

  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const symbolSerializeQueryValue = plugin.symbol('serializeQueryKeyValue', {
    external: clientModule,
  });

  const fn = $.const(symbolCreateQueryKey).assign(
    $.func()
      .param('id', (p) => p.type('string'))
      .param('options', (p) => p.optional().type(TOptionsType))
      .param('tags', (p) => p.optional().type('ReadonlyArray<string>'))
      .returns($.type.tuple(returnType))
      .generic(TOptionsType, (g) => g.extends(symbolOptions))
      .do(
        $.const('params')
          .type(returnType)
          .assign(
            $.object()
              .prop('_id', 'id')
              .prop(
                baseUrlKey,
                $('options')
                  .attr(baseUrlKey)
                  .optional()
                  .or(
                    $('options')
                      .attr('client')
                      .optional()
                      .$if(symbolClient, (a, v) => a.coalesce(v))
                      .attr('getConfig')
                      .call()
                      .attr(baseUrlKey),
                  ),
              )
              .as(returnType),
          ),
        $.if('tags').do(
          $('params').attr('tags').assign($('tags').as('unknown').as(plugin.imports._JSONValue)),
        ),
        $.if($('options').attr('body').optional().neq($.id('undefined'))).do(
          $.const('normalizedBody').assign(
            $(symbolSerializeQueryValue).call($('options').attr('body')),
          ),
          $.if($('normalizedBody').neq($.id('undefined'))).do(
            $('params').attr('body').assign('normalizedBody'),
          ),
        ),
        $.if($('options').attr('path').optional()).do(
          $('params').attr('path').assign($('options').attr('path')),
        ),
        $.if($('options').attr('query').optional().neq($.id('undefined'))).do(
          $.const('normalizedQuery').assign(
            $(symbolSerializeQueryValue).call($('options').attr('query')),
          ),
          $.if($('normalizedQuery').neq($.id('undefined'))).do(
            $('params').attr('query').assign('normalizedQuery'),
          ),
        ),
        $.return($.array($('params'))),
      ),
  );
  plugin.node(fn);
};

const createQueryKeyLiteral = ({
  id,
  operation,
  plugin,
}: {
  id: string;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const config = plugin.config.queryKeys;
  let tagsExpression: ReturnType<typeof $.array> | undefined;
  if (config.tags && operation.tags && operation.tags.length) {
    tagsExpression = $.array(...operation.tags.map((tag) => $.literal(tag)));
  }
  // TODO: contract (self)
  const symbolCreateQueryKey = plugin.referenceSymbol({
    artifact: '@pinia/colada',
    category: 'utility',
    resource: 'createQueryKey',
  });
  const createQueryKeyCallExpression = $(symbolCreateQueryKey).call(
    $.literal(id),
    'options',
    tagsExpression,
  );
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({ plugin }: { plugin: PiniaColadaPlugin['Instance'] }) => {
  // TODO: contract (cross)
  const symbolOptions = plugin.referenceSymbol({
    artifact: 'sdk',
    category: 'type',
    resource: 'client-options',
  });
  const symbolQueryKeyType = plugin.symbol('QueryKey', {
    meta: {
      category: 'type',
      resource: 'QueryKey',
    },
  });
  const queryKeyType = $.type
    .alias(symbolQueryKeyType)
    .export()
    .generic(TOptionsType, (g) => g.extends($.type(symbolOptions)))
    .type(
      $.type.tuple(
        $.type.and(
          $.type(`Pick<${TOptionsType}, 'path'>`),
          $.type
            .object()
            .prop('_id', (p) => p.type('string'))
            .prop(getClientBaseUrlKey(getTypedConfig(plugin)), (p) =>
              p.optional().type(plugin.imports._JSONValue),
            )
            .prop('body', (p) => p.optional().type(plugin.imports._JSONValue))
            .prop('query', (p) => p.optional().type(plugin.imports._JSONValue))
            .prop('tags', (p) => p.optional().type(plugin.imports._JSONValue)),
        ),
      ),
    );
  plugin.node(queryKeyType);
};

export const queryKeyStatement = ({
  operation,
  plugin,
  symbol,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  symbol: Symbol;
}) => {
  const client = getClientPlugin(getTypedConfig(plugin));
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const statement = $.const(symbol)
    .export()
    .assign(
      $.func()
        .param('options', (p) =>
          p
            .required(hasOperationDataRequired(operation))
            .type(getPublicTypeData({ isNuxtClient, operation, plugin })),
        )
        .do(
          createQueryKeyLiteral({
            id: operation.id,
            operation,
            plugin,
          }).return(),
        ),
    );
  return statement;
};
