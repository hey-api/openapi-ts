import { $ } from '../../../../py-dsl';
import type { UnionResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';
import type { FieldConstraints } from '../constants';

function baseNode(ctx: UnionResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;

  const nonNullResults: Array<PydanticResult> = [];
  let isNullable = false;

  for (const result of childResults) {
    if (result.type === 'None') {
      isNullable = true;
    } else {
      nonNullResults.push(result);
    }
  }

  isNullable = isNullable || childResults.some((r) => r.meta.nullable);

  if (!nonNullResults.length) {
    return {
      type: 'None',
    };
  }

  if (nonNullResults.length === 1) {
    const finalResult = applyModifiers(nonNullResults[0]!);
    return finalResult;
  }

  const itemTypes = nonNullResults.map((r) => applyModifiers(r).type ?? plugin.symbols.typing.Any);

  if (isNullable) {
    itemTypes.push('None');
  }

  return {
    type: $(plugin.symbols.typing.Union).slice(...itemTypes),
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
  const constraints: FieldConstraints = {};

  if (parentSchema.description !== undefined) {
    constraints.description = parentSchema.description;
  }

  let isNullable = false;
  for (const result of childResults) {
    if (result.type === 'None') {
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

  const resolver = plugin.config['~resolvers']?.union;
  const resolved = resolver?.(resolverCtx) ?? unionResolver(resolverCtx);

  return {
    ...resolved,
    childResults,
    fieldConstraints: Object.keys(constraints).length
      ? { ...constraints, ...resolved.fieldConstraints }
      : resolved.fieldConstraints,
    isNullable,
  };
}
