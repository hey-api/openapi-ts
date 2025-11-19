import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { getClientBaseUrlKey } from '~/plugins/@hey-api/client-core/utils';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { useTypeData } from './shared/useType';
import type { PluginInstance } from './types';

const TOptionsType = 'TOptions';

export const createQueryKeyFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const symbolCreateQueryKey = plugin.registerSymbol({
    meta: {
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'createQueryKey',
    }),
  });
  const symbolQueryKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'QueryKey',
    tool: plugin.name,
  });

  const baseUrlKey = getClientBaseUrlKey(plugin.context.config);

  const symbolClient = plugin.getSymbol({
    category: 'client',
  });

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });

  const returnType = $.type(symbolQueryKeyType.placeholder)
    .generic(TOptionsType)
    .idx(0);

  const fn = $.const(symbolCreateQueryKey.placeholder).assign(
    $.func()
      .param('id', (p) => p.type('string'))
      .param('options', (p) => p.optional().type(TOptionsType))
      .param('infinite', (p) => p.optional().type('boolean'))
      .param('tags', (p) => p.optional().type('ReadonlyArray<string>'))
      .generic(TOptionsType, (g) => g.extends(symbolOptions.placeholder))
      .returns($.type.tuple(returnType))
      .do(
        $.const('params')
          .type(returnType)
          .assign(
            $.object()
              .prop('_id', 'id')
              .prop(
                baseUrlKey,
                `options?.${baseUrlKey} || (options?.client ?? ${symbolClient?.placeholder}).getConfig().${baseUrlKey}`,
              )
              .as(returnType),
          ),
        $.if('infinite').do($('params').attr('_infinite').assign('infinite')),
        $.if('tags').do($('params').attr('tags').assign('tags')),
        $.if($('options').attr('body').optional()).do(
          $('params').attr('body').assign($('options').attr('body')),
        ),
        $.if($('options').attr('headers').optional()).do(
          $('params').attr('headers').assign($('options').attr('headers')),
        ),
        $.if($('options').attr('path').optional()).do(
          $('params').attr('path').assign($('options').attr('path')),
        ),
        $.if($('options').attr('query').optional()).do(
          $('params').attr('query').assign($('options').attr('query')),
        ),
        $.return($.array().element($('params'))),
      ),
  );
  plugin.setSymbolValue(symbolCreateQueryKey, fn);
};

const createQueryKeyLiteral = ({
  id,
  isInfinite,
  operation,
  plugin,
}: {
  id: string;
  isInfinite?: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const config = isInfinite
    ? plugin.config.infiniteQueryKeys
    : plugin.config.queryKeys;
  let tagsArray: TsDsl<ts.ArrayLiteralExpression> | undefined;
  if (config.tags && operation.tags && operation.tags.length > 0) {
    tagsArray = $.array().elements(...operation.tags);
  }
  const symbolCreateQueryKey = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createQueryKey',
    tool: plugin.name,
  });
  const createQueryKeyCallExpression = $(symbolCreateQueryKey.placeholder).call(
    $.literal(id),
    'options',
    isInfinite || tagsArray ? $.literal(Boolean(isInfinite)) : undefined,
    tagsArray,
  );
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({ plugin }: { plugin: PluginInstance }) => {
  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolQueryKeyType = plugin.registerSymbol({
    exported: true,
    kind: 'type',
    meta: {
      category: 'type',
      resource: 'QueryKey',
      tool: plugin.name,
    },
    name: 'QueryKey',
  });
  const queryKeyType = $.type
    .alias(symbolQueryKeyType.placeholder)
    .export(symbolQueryKeyType.exported)
    .generic(TOptionsType, (g) => g.extends(symbolOptions.placeholder))
    .type(
      $.type.tuple(
        $.type.and(
          $.type(
            `Pick<${TOptionsType}, '${getClientBaseUrlKey(plugin.context.config)}' | 'body' | 'headers' | 'path' | 'query'>`,
          ),
          $.type
            .object()
            .prop('_id', (p) => p.type('string'))
            .prop('_infinite', (p) => p.optional().type('boolean'))
            .prop('tags', (p) => p.optional().type('ReadonlyArray<string>')),
        ),
      ),
    );
  plugin.setSymbolValue(symbolQueryKeyType, queryKeyType);
};

export const queryKeyStatement = ({
  isInfinite,
  operation,
  plugin,
  symbol,
  typeQueryKey,
}: {
  isInfinite: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  symbol: Symbol;
  typeQueryKey?: string;
}) => {
  const typeData = useTypeData({ operation, plugin });
  const statement = $.const(symbol.placeholder)
    .export(symbol.exported)
    .assign(
      $.func()
        .param('options', (p) =>
          p.required(hasOperationDataRequired(operation)).type(typeData),
        )
        .$if(isInfinite && typeQueryKey, (f, v) => f.returns(v))
        .do(
          createQueryKeyLiteral({
            id: operation.id,
            isInfinite,
            operation,
            plugin,
          }).return(),
        ),
    );
  return statement;
};
