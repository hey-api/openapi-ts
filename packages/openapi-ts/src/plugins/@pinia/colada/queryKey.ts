import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming, hasOperationDataRequired } from '@hey-api/shared';
import type ts from 'typescript';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import { getClientBaseUrlKey, getClientPlugin } from '../../../plugins/@hey-api/client-core/utils';
import type { MaybeTsDsl } from '../../../ts-dsl';
import { $ } from '../../../ts-dsl';
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
        tool: plugin.name,
      },
    },
  );
  const symbolQueryKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'QueryKey',
    tool: plugin.name,
  });
  const symbolJsonValue = plugin.external(`${plugin.name}._JSONValue`);

  const returnType = $.type(symbolQueryKeyType).generic(TOptionsType).idx(0);

  const baseUrlKey = getClientBaseUrlKey(getTypedConfig(plugin));

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolClient = plugin.getSymbol({
    category: 'client',
  });

  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const symbolSerializeQueryValue = plugin.symbol('serializeQueryKeyValue', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: `${clientModule}.serializeQueryKeyValue`,
    },
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
          $('params').attr('tags').assign($('tags').as('unknown').as(symbolJsonValue)),
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
  optionsExpr = 'options',
  plugin,
}: {
  id: string;
  operation: IR.OperationObject;
  optionsExpr?: string | MaybeTsDsl<ts.Expression>;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const config = plugin.config.queryKeys;
  let tagsExpression: ReturnType<typeof $.array> | undefined;
  if (config.tags && operation.tags && operation.tags.length > 0) {
    tagsExpression = $.array(...operation.tags.map((tag) => $.literal(tag)));
  }

  const symbolCreateQueryKey = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createQueryKey',
    tool: plugin.name,
  });
  const createQueryKeyCallExpression = $(symbolCreateQueryKey).call(
    $.literal(id),
    optionsExpr,
    tagsExpression,
  );
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({ plugin }: { plugin: PiniaColadaPlugin['Instance'] }) => {
  const symbolJsonValue = plugin.external(`${plugin.name}._JSONValue`);

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolQueryKeyType = plugin.symbol('QueryKey', {
    meta: {
      category: 'type',
      resource: 'QueryKey',
      tool: plugin.name,
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
              p.optional().type(symbolJsonValue),
            )
            .prop('body', (p) => p.optional().type(symbolJsonValue))
            .prop('query', (p) => p.optional().type(symbolJsonValue))
            .prop('tags', (p) => p.optional().type(symbolJsonValue)),
        ),
      ),
    );
  plugin.node(queryKeyType);
};

export const createQueryKeyOptionsType = ({
  plugin,
}: {
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolQueryKeyOptionsType = plugin.symbol('QueryKeyOptions', {
    meta: {
      category: 'type',
      resource: 'QueryKeyOptions',
      tool: plugin.name,
    },
  });
  const queryKeyOptionsType = $.type
    .alias(symbolQueryKeyOptionsType)
    .export()
    .generic(TOptionsType, (g) => g.extends($.type(symbolOptions)))
    .type(
      $.type.or(
        $.type(TOptionsType),
        $.type.and(
          $.type(
            `{ [K in keyof Omit<${TOptionsType}, 'url'>]?: ${TOptionsType}[K] extends object ? Partial<${TOptionsType}[K]> : ${TOptionsType}[K] }`,
          ),
          $.type.object().prop('strict', (p) => p.type($.type.literal(false))),
        ),
      ),
    );
  plugin.node(queryKeyOptionsType);
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
  const typeData = getPublicTypeData({ isNuxtClient, operation, plugin });
  const isRequired = hasOperationDataRequired(operation);
  let paramType: ReturnType<typeof $.type>;
  if (isRequired) {
    const symbolQueryKeyOptionsType = plugin.referenceSymbol({
      category: 'type',
      resource: 'QueryKeyOptions',
      tool: plugin.name,
    });
    paramType = $.type(symbolQueryKeyOptionsType).generic(typeData);
  } else {
    paramType = typeData;
  }
  const statement = $.const(symbol)
    .export()
    .assign(
      $.func()
        .param('options', (p) => p.required(isRequired).type(paramType))
        .do(
          createQueryKeyLiteral({
            id: operation.id,
            operation,
            optionsExpr: isRequired ? $('options').as(typeData) : 'options',
            plugin,
          }).return(),
        ),
    );
  return statement;
};
