import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { NumberResolverContext } from '../../resolvers';
import { brandType } from '../../shared/brand';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(ctx: NumberResolverContext): Type {
  const { plugin, schema } = ctx;

  if (schema.type === 'integer' && schema.format === 'int64') {
    if (plugin.getPlugin('@hey-api/transformers')?.config.bigInt) {
      return $.type('bigint');
    }
  }

  return $.type('number');
}

function brandNode(ctx: NumberResolverContext): Type | undefined {
  const base = ctx.nodes.base(ctx);
  return brandType({ base, brandable: ctx.brandable, path: ctx.path, plugin: ctx.plugin });
}

function constNode(ctx: NumberResolverContext): Type | undefined {
  const { schema } = ctx;
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
  }
}

function numberResolver(ctx: NumberResolverContext): Type {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  const brandResult = ctx.nodes.brand(ctx);
  if (brandResult) return brandResult;

  return ctx.nodes.base(ctx);
}

export function numberToAst({
  brandable,
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  brandable?: boolean;
  schema: SchemaWithType<'integer' | 'number'>;
}): Type {
  const ctx: NumberResolverContext = {
    $,
    brandable,
    nodes: {
      base: baseNode,
      brand: brandNode,
      const: constNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.number ?? plugin.config['~resolvers']?.number;
  return resolver?.(ctx) ?? numberResolver(ctx);
}
