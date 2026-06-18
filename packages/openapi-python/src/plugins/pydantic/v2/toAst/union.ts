import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { UnionResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';

function baseNode(ctx: UnionResolverContext): PydanticType {
  const { applyModifiers, childResults } = ctx;

  const nonNullResults: Array<PydanticResult> = [];
  let isNullable = false;

  for (const result of childResults) {
    if (result.type?.type === 'None') {
      isNullable = true;
    } else {
      nonNullResults.push(result);
    }
  }

  isNullable = isNullable || childResults.some((r) => r.meta.nullable);

  if (!nonNullResults.length) {
    return { type: $$.constrainedType('None') };
  }

  if (nonNullResults.length === 1 && !isNullable) {
    return applyModifiers(nonNullResults[0]!);
  }

  const nonNullMembers = nonNullResults.map(
    (r) => applyModifiers(r).type ?? $$.constrainedType(ctx.plugin.imports.typing.Any),
  );

  const unionMembers = nonNullMembers;
  const unionType = $$.constrainedType($.type.or(...unionMembers.map((m) => m.type)));

  const discriminator =
    ctx.parentSchema.discriminator?.propertyName ??
    (nonNullResults.length === 1 ? nonNullResults[0]!.discriminator : undefined);

  return {
    node: { kind: 'rootModel', type: unionType },
    type: unionType,
    unionMembers,
    ...(discriminator && { discriminator }),
  };
}

function unionResolver(ctx: UnionResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export interface UnionToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
  isNullable: boolean;
}

export function unionToType({
  applyModifiers,
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<
  UnionResolverContext,
  'applyModifiers' | 'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'
>): UnionToTypeResult {
  let isNullable = false;
  for (const result of childResults) {
    if (result.type?.type === 'None') {
      isNullable = true;
      break;
    }
  }
  isNullable = isNullable || childResults.some((r) => r.meta.nullable);

  const resolverCtx: UnionResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    path,
    plugin,
    schema: parentSchema,
    schemas,
  };

  const resolver = plugin.config.$resolvers?.union ?? plugin.config['~resolvers']?.union;
  let resolved = resolver?.(resolverCtx) ?? unionResolver(resolverCtx);

  if (parentSchema.description !== undefined) {
    const c = $$.constraints().description(parentSchema.description);
    const base = resolved.type ?? $$.constrainedType('None');
    resolved = { ...resolved, type: base.mergeConstraints(c) };
  }

  return {
    ...resolved,
    childResults,
    isNullable,
  };
}
