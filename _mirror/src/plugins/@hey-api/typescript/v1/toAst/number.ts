import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { NumberResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function constNode(ctx: NumberResolverContext): Type | undefined {
  const { schema } = ctx;
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
  }
}

function baseNode(ctx: NumberResolverContext): Type {
  const { plugin, schema } = ctx;

  if (schema.type === 'integer' && schema.format === 'int64') {
    if (plugin.getPlugin('@hey-api/transformers')?.config.bigInt) {
      return $.type('bigint');
    }
  }

  return $.type('number');
}

function numberResolver(ctx: NumberResolverContext): Type {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function numberToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Type {
  const ctx: NumberResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.number ?? plugin.config['~resolvers']?.number;
  return resolver?.(ctx) ?? numberResolver(ctx);
}
