import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { ArrayResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';

function baseNode(ctx: ArrayResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;
  const any = plugin.imports.typing.Any;

  if (!childResults.length) {
    const type = $$.constrainedType($('list').slice(any));
    return {
      node: { kind: 'rootModel', type },
      type,
    };
  }

  if (childResults.length === 1) {
    const itemResult = applyModifiers(childResults[0]!);
    const type = $$.constrainedType($('list').slice(itemResult.type?.type ?? any));
    return {
      node: { kind: 'rootModel', type },
      type,
    };
  }

  const itemTypes = childResults.map((r) => applyModifiers(r).type?.type ?? any);
  const type = $$.constrainedType($('list').slice($.type.or(...itemTypes)));
  return {
    node: { kind: 'rootModel', type },
    type,
  };
}

function arrayResolver(ctx: ArrayResolverContext): PydanticType {
  const baseResult = ctx.nodes.base(ctx);
  const { schema } = ctx;
  const c = $$.constraints();

  if (schema.minItems !== undefined) c.minLength(schema.minItems);
  if (schema.maxItems !== undefined) c.maxLength(schema.maxItems);
  if (schema.description !== undefined) c.description(schema.description);

  if (!c.isEmpty && baseResult.type) {
    return {
      node: baseResult.node,
      type: baseResult.type.mergeConstraints(c),
    };
  }

  return baseResult;
}

export interface ArrayToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

export function arrayToType(
  ctx: Pick<ArrayResolverContext, 'applyModifiers' | 'path' | 'plugin' | 'schema' | 'walk'>,
): ArrayToTypeResult {
  const { applyModifiers, path, plugin, schema, walk } = ctx;
  const any = plugin.imports.typing.Any;

  const childResults: Array<PydanticResult> = [];

  if (schema.items) {
    const normalizedSchema = deduplicateSchema({ schema });
    for (let i = 0; i < normalizedSchema.items!.length; i++) {
      const item = normalizedSchema.items![i]!;
      const result = walk(item, childContext({ path, plugin }, 'items', i));
      childResults.push(result);
    }
  }

  const resolverCtx: ArrayResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
    walk,
  };

  const resolver = plugin.config['~resolvers']?.array;
  const resolved = resolver?.(resolverCtx) ?? arrayResolver(resolverCtx);

  if (!resolved.type) {
    resolved.type = $$.constrainedType($('list').slice(any));
  }

  return {
    ...resolved,
    childResults,
  };
}
