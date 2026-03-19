import { ref } from '@hey-api/codegen-core';
import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { TupleResolverContext } from '../../resolvers';
import type { Type, TypeScriptResult } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(ctx: TupleResolverContext): Type {
  const { plugin, schema, walk } = ctx;
  const itemTypes: Array<Type> = [];

  if (schema.items) {
    schema.items.forEach((item) => {
      const result = walk(item, { path: ref([]), plugin });
      itemTypes.push(result.type);
    });
  }

  return $.type.tuple(...itemTypes);
}

function constNode(ctx: TupleResolverContext): Type | undefined {
  const { schema } = ctx;

  if (!schema.const || !Array.isArray(schema.const)) {
    return;
  }

  const itemTypes = schema.const.map((value) => $.type.fromValue(value));
  return $.type.tuple(...itemTypes);
}

function tupleResolver(ctx: TupleResolverContext): Type {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function tupleToAst({
  plugin,
  schema,
  walk,
  walkerCtx,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']>;
}): Type {
  const ctx: TupleResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    plugin,
    schema,
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.tuple;
  const result = resolver?.(ctx);
  return result ?? tupleResolver(ctx);
}
