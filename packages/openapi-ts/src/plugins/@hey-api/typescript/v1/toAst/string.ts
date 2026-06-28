import type { SymbolMeta } from '@hey-api/codegen-core';
import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { StringResolverContext } from '../../resolvers';
import { brandType } from '../../shared/brand';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function typeidMeta(resourceId: string) {
  return {
    artifact: 'types',
    category: 'type',
    resource: 'type-id',
    resourceId,
  } as const satisfies SymbolMeta;
}

const typeidContainerMeta = {
  artifact: 'types',
  category: 'type',
  resource: 'type-id',
  variant: 'container',
} as const satisfies SymbolMeta;

function ensureTypeidContainer(plugin: HeyApiTypeScriptPlugin['Instance']): void {
  // TODO: contract (self)
  if (plugin.querySymbol(typeidContainerMeta)) return;

  const symbolTypeId = plugin.symbol('TypeID', {
    meta: typeidContainerMeta,
  });
  const nodeTypeId = $.type
    .alias(symbolTypeId)
    .export()
    .generic('T', (g) => g.extends('string'))
    .type($.type.template().add($.type('T')).add('_').add($.type('string')));
  plugin.node(nodeTypeId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function baseNode(ctx: StringResolverContext): Type {
  return $.type('string');
}

function brandNode(ctx: StringResolverContext): Type | undefined {
  const base = ctx.nodes.base(ctx);
  return brandType({ base, brandable: ctx.brandable, path: ctx.path, plugin: ctx.plugin });
}

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
    const dates = plugin.getPlugin('@hey-api/transformers')?.config.dates;
    if (dates) {
      if (dates === 'temporal') {
        return $.type(plugin.imports.temporalPolyfill.Temporal).attr(
          format === 'date' ? 'PlainDate' : 'Instant',
        );
      }
      return $.type('Date');
    }
  }

  if (format === 'typeid' && typeof schema.example === 'string') {
    const parts = String(schema.example).split('_');
    parts.pop();
    const typeidBase = parts.join('_');
    const typeidQuery = typeidMeta(typeidBase);

    // TODO: contract (self)
    if (!plugin.querySymbol(typeidQuery)) {
      ensureTypeidContainer(plugin);
      // TODO: contract (self)
      const refSymbol = plugin.referenceSymbol(typeidContainerMeta);
      const symbolTypeName = plugin.symbol(toCase(`${typeidBase}_id`, plugin.config.case), {
        meta: typeidQuery,
      });
      const node = $.type
        .alias(symbolTypeName)
        .export()
        .type($.type(refSymbol).generic($.type.literal(typeidBase)));
      plugin.node(node);
    }
    // TODO: contract (self)
    return $.type(plugin.referenceSymbol(typeidQuery));
  }
}

function stringResolver(ctx: StringResolverContext): Type {
  if (ctx.schema.const !== undefined) {
    const constResult = ctx.nodes.const(ctx);
    if (constResult) return constResult;
  }

  const formatResult = ctx.nodes.format(ctx);
  if (formatResult) return formatResult;

  const brandResult = ctx.nodes.brand(ctx);
  if (brandResult) return brandResult;

  return ctx.nodes.base(ctx);
}

export function stringToAst({
  brandable,
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  brandable?: boolean;
  schema: SchemaWithType<'string'>;
}): Type {
  const ctx: StringResolverContext = {
    $,
    brandable,
    nodes: {
      base: baseNode,
      brand: brandNode,
      const: constNode,
      format: formatNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.string ?? plugin.config['~resolvers']?.string;
  return resolver?.(ctx) ?? stringResolver(ctx);
}
