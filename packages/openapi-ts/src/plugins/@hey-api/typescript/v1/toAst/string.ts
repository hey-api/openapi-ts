import type { SymbolMeta } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { StringResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function constNode(ctx: StringResolverContext): Type | undefined {
  const { schema } = ctx;
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
  }
}

function formatNode(ctx: StringResolverContext): Type | undefined {
  const { plugin, schema } = ctx;
  const { format } = schema;

  if (!format) return;

  if (format === 'binary') {
    return $.type.or($.type('Blob'), $.type('File'));
  }

  if (format === 'date-time' || format === 'date') {
    if (plugin.getPlugin('@hey-api/transformers')?.config.dates) {
      return $.type('Date');
    }
  }

  if (format === 'typeid' && typeof schema.example === 'string') {
    const parts = String(schema.example).split('_');
    parts.pop();
    const typeidBase = parts.join('_');

    const typeidQuery: SymbolMeta = {
      category: 'type',
      resource: 'type-id',
      resourceId: typeidBase,
      tool: 'typescript',
    };
    if (!plugin.getSymbol(typeidQuery)) {
      const containerQuery: SymbolMeta = {
        category: 'type',
        resource: 'type-id',
        tool: 'typescript',
        variant: 'container',
      };

      if (!plugin.getSymbol(containerQuery)) {
        const symbolTypeId = plugin.symbol('TypeID', {
          meta: containerQuery,
        });
        const nodeTypeId = $.type
          .alias(symbolTypeId)
          .export()
          .generic('T', (g) => g.extends('string'))
          .type($.type.template().add($.type('T')).add('_').add($.type('string')));
        plugin.node(nodeTypeId);
      }

      const refSymbol = plugin.referenceSymbol(containerQuery);
      const symbolTypeName = plugin.symbol(toCase(`${typeidBase}_id`, plugin.config.case), {
        meta: typeidQuery,
      });
      const node = $.type
        .alias(symbolTypeName)
        .export()
        .type($.type(refSymbol).generic($.type.literal(typeidBase)));
      plugin.node(node);
    }
    return $.type(plugin.referenceSymbol(typeidQuery));
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function baseNode(ctx: StringResolverContext): Type {
  return $.type('string');
}

function stringResolver(ctx: StringResolverContext): Type {
  if (ctx.schema.const !== undefined) {
    const constResult = ctx.nodes.const(ctx);
    if (constResult) return constResult;
  }

  const formatResult = ctx.nodes.format(ctx);
  if (formatResult) return formatResult;

  return ctx.nodes.base(ctx);
}

export function stringToAst({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): Type {
  const ctx: StringResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
      format: formatNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.string;
  const result = resolver?.(ctx);
  return result ?? stringResolver(ctx);
}
