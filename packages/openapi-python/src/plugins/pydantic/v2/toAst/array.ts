import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { ArrayResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';
import type { FieldConstraints } from '../constants';

function baseNode(ctx: ArrayResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;
  const any = plugin.symbols.typing.Any;

  if (!childResults.length) {
    return {
      type: $('list').slice(any),
    };
  }

  if (childResults.length === 1) {
    const itemResult = applyModifiers(childResults[0]!);
    return {
      type: $('list').slice(itemResult.type ?? any),
    };
  }

  const itemTypes = childResults.map((r) => applyModifiers(r).type ?? any);

  return {
    type: $('list').slice($.type.or(...itemTypes)),
  };
}

function minLengthNode(ctx: ArrayResolverContext): PydanticType | undefined {
  const { schema } = ctx;
  if (schema.minItems === undefined) return;
  return {
    fieldConstraints: { min_length: schema.minItems },
  };
}

function maxLengthNode(ctx: ArrayResolverContext): PydanticType | undefined {
  const { schema } = ctx;
  if (schema.maxItems === undefined) return;
  return {
    fieldConstraints: { max_length: schema.maxItems },
  };
}

function arrayResolver(ctx: ArrayResolverContext): PydanticType {
  const baseResult = ctx.nodes.base(ctx);
  const minLengthResult = ctx.nodes.minLength(ctx);
  const maxLengthResult = ctx.nodes.maxLength(ctx);

  const fieldConstraints: FieldConstraints = {
    ...(baseResult.fieldConstraints ?? {}),
    ...(minLengthResult?.fieldConstraints ?? {}),
    ...(maxLengthResult?.fieldConstraints ?? {}),
  };

  if (ctx.schema.description !== undefined) {
    fieldConstraints.description = ctx.schema.description;
  }

  return {
    ...baseResult,
    fieldConstraints: Object.keys(fieldConstraints).length ? fieldConstraints : undefined,
  };
}

export interface ArrayToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

export function arrayToType(
  ctx: Pick<ArrayResolverContext, 'applyModifiers' | 'path' | 'plugin' | 'schema' | 'walk'>,
): ArrayToTypeResult {
  const { applyModifiers, path, plugin, schema, walk } = ctx;
  const any = plugin.symbols.typing.Any;

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
      maxLength: maxLengthNode,
      minLength: minLengthNode,
    },
    path,
    plugin,
    schema,
    walk,
  };

  const resolver = plugin.config['~resolvers']?.array;
  const resolved = resolver?.(resolverCtx) ?? arrayResolver(resolverCtx);

  if (!resolved.type) {
    resolved.type = $('list').slice(any);
  }

  return {
    ...resolved,
    childResults,
  };
}
