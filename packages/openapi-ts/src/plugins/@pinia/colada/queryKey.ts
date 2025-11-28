import type { Symbol } from '@hey-api/codegen-core';

import { clientFolderAbsolutePath } from '~/generate/client';
import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { getClientBaseUrlKey } from '~/plugins/@hey-api/client-core/utils';
import { $ } from '~/ts-dsl';

import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './useType';
import { getPublicTypeData } from './utils';

const TOptionsType = 'TOptions';

export const createQueryKeyFunction = ({
  plugin,
}: {
  plugin: PiniaColadaPlugin['Instance'];
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
  const symbolJsonValue = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}._JSONValue`,
  });

  const returnType = $.type(symbolQueryKeyType).generic(TOptionsType).idx(0);

  const baseUrlKey = getClientBaseUrlKey(plugin.context.config);

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolClient = plugin.getSymbol({
    category: 'client',
  });

  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const symbolSerializeQueryValue = plugin.registerSymbol({
    external: clientModule,
    meta: {
      category: 'external',
      resource: `${clientModule}.serializeQueryKeyValue`,
    },
    name: 'serializeQueryKeyValue',
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
                `options?.${baseUrlKey} || (options?.client ?? ${symbolClient?.placeholder}).getConfig().${baseUrlKey}`,
              )
              .as(returnType),
          ),
        $.if('tags').do(
          $('params')
            .attr('tags')
            .assign($('tags').as('unknown').as(symbolJsonValue)),
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
  plugin.addNode(fn);
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
    'options',
    tagsExpression,
  );
  return createQueryKeyCallExpression;
};

export const createQueryKeyType = ({
  plugin,
}: {
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  const symbolJsonValue = plugin.referenceSymbol({
    category: 'external',
    resource: `${plugin.name}._JSONValue`,
  });

  const symbolOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client-options',
    tool: 'sdk',
  });
  const symbolQueryKeyType = plugin.registerSymbol({
    meta: {
      category: 'type',
      resource: 'QueryKey',
      tool: plugin.name,
    },
    name: 'QueryKey',
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
            .prop(getClientBaseUrlKey(plugin.context.config), (p) =>
              p.optional().type(symbolJsonValue),
            )
            .prop('body', (p) => p.optional().type(symbolJsonValue))
            .prop('query', (p) => p.optional().type(symbolJsonValue))
            .prop('tags', (p) => p.optional().type(symbolJsonValue)),
        ),
      ),
    );
  plugin.addNode(queryKeyType);
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
  const typeData = useTypeData({ operation, plugin });
  const { strippedTypeData } = getPublicTypeData({ plugin, typeData });
  const statement = $.const(symbol)
    .export()
    .assign(
      $.func()
        .param('options', (p) =>
          p
            .required(hasOperationDataRequired(operation))
            .type(strippedTypeData),
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
