import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { BooleanResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(): Type {
  return $.type('boolean');
}

function constNode(ctx: BooleanResolverContext): Type | undefined {
  const { schema } = ctx;
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
  }
}

function booleanResolver(ctx: BooleanResolverContext): Type {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function booleanToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  schema: SchemaWithType<'boolean'>;
}): Type {
  const ctx: BooleanResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.boolean;
  const result = resolver?.(ctx);
  return result ?? booleanResolver(ctx);
}
