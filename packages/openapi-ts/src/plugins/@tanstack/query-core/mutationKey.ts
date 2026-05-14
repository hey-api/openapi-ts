import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { getClientBaseUrlKey } from '../../../plugins/@hey-api/client-core/utils';
import { $ } from '../../../ts-dsl';
import { useTypeData } from './shared/useType';
import type { PluginInstance } from './types';

const TOptionsType = 'TOptions';

export function createMutationKeyFunction({ plugin }: { plugin: PluginInstance }): void {
  const symbolCreateMutationKey = plugin.symbol(
    applyNaming('createMutationKey', {
      case: plugin.config.case,
    }),
    {
      meta: {
        category: 'utility',
        resource: 'createMutationKey',
        tool: plugin.name,
      },
    },
  );
  const symbolMutationKeyType = plugin.referenceSymbol({
    category: 'type',
    resource: 'MutationKey',
    tool: plugin.name,
  });

  const baseUrlKey = getClientBaseUrlKey(getTypedConfig(plugin));

  const symbolClient = plugin.querySymbol({
    category: 'client',
  });

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });

  const returnType = $.type(symbolMutationKeyType).generic(TOptionsType).idx(0);

  const fn = $.const(symbolCreateMutationKey).assign(
    $.func()
      .param('id', (p) => p.type('string'))
      .param('options', (p) => p.optional().type(TOptionsType))
      .param('tags', (p) => p.optional().type('ReadonlyArray<string>'))
      .generic(TOptionsType, (g) => g.extends($.type('Partial').generic(symbolOptions)))
      .returns($.type.tuple(returnType))
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
              ),
          ),
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
  plugin.node(fn);
}

function createMutationKeyLiteral({
  id,
  operation,
  plugin,
}: {
  id: string;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): ReturnType<typeof $.call> {
  const config = plugin.config.mutationKeys;
  let tagsArray: ReturnType<typeof $.array> | undefined;
  if (config.tags && operation.tags && operation.tags.length) {
    tagsArray = $.array().elements(...operation.tags);
  }
  const symbolCreateMutationKey = plugin.referenceSymbol({
    category: 'utility',
    resource: 'createMutationKey',
    tool: plugin.name,
  });
  const createMutationKeyCallExpression = $(symbolCreateMutationKey).call(
    $.literal(id),
    'options',
    tagsArray,
  );
  return createMutationKeyCallExpression;
}

export function createMutationKeyType({ plugin }: { plugin: PluginInstance }): void {
  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolMutationKeyType = plugin.symbol('MutationKey', {
    meta: {
      category: 'type',
      resource: 'MutationKey',
      tool: plugin.name,
    },
  });
  const mutationKeyType = $.type
    .alias(symbolMutationKeyType)
    .export()
    .generic(TOptionsType, (g) => g.extends($.type('Partial').generic(symbolOptions)))
    .type(
      $.type.tuple(
        $.type.and(
          $.type(
            `Pick<${TOptionsType}, '${getClientBaseUrlKey(getTypedConfig(plugin))}' | 'body' | 'headers' | 'path' | 'query'>`,
          ),
          $.type
            .object()
            .prop('_id', (p) => p.type('string'))
            .prop('tags', (p) => p.optional().type('ReadonlyArray<string>')),
        ),
      ),
    );
  plugin.node(mutationKeyType);
}

export function mutationKeyStatement({
  operation,
  plugin,
  symbol,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  symbol: Symbol;
}): ReturnType<typeof $.const> {
  const typeData = useTypeData({ operation, plugin });
  const statement = $.const(symbol)
    .export()
    .assign(
      $.func()
        .param('options', (p) => p.optional().type($.type('Partial').generic(typeData)))
        .do(
          createMutationKeyLiteral({
            id: operation.id,
            operation,
            plugin,
          }).return(),
        ),
    );
  return statement;
}
