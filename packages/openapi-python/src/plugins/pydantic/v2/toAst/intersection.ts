import { isSymbol } from '@hey-api/codegen-core';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { IntersectionResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';

function isReferenceResult(result: PydanticResult): boolean {
  // A reference result has no pre-resolved node and its type is a Symbol
  // (set by the visitor's reference() handler via plugin.referenceSymbol()).
  return !result.node && result.type !== undefined && isSymbol(result.type.type);
}

function baseNode(ctx: IntersectionResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;

  if (!childResults.length) {
    return { type: $$.constrainedType(plugin.imports.typing.Any) };
  }

  if (childResults.length === 1) {
    return applyModifiers(childResults[0]!);
  }

  const baseClasses: Array<ReturnType<typeof $$.constrainedType>> = [];

  for (const result of childResults) {
    if (isReferenceResult(result)) {
      const t = result.type!;
      if (!baseClasses.includes(t)) baseClasses.push(t);
    }
  }

  if (baseClasses.length) {
    return { type: baseClasses[0]! };
  }

  return { type: $$.constrainedType(plugin.imports.typing.Any) };
}

function intersectionResolver(ctx: IntersectionResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export interface IntersectionToTypeResult extends PydanticType {
  baseClasses?: Array<ReturnType<typeof $$.constrainedType>>;
  childResults: Array<PydanticResult>;
  mergedFields?: Array<ReturnType<typeof $$.field>>;
}

export function intersectionToType({
  applyModifiers,
  childResults,
  parentSchema,
  path,
  plugin,
}: Pick<
  IntersectionResolverContext,
  'applyModifiers' | 'childResults' | 'parentSchema' | 'path' | 'plugin'
>): IntersectionToTypeResult {
  const resolverCtx: IntersectionResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: { base: baseNode },
    parentSchema,
    path,
    plugin,
    schema: parentSchema,
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  let resolved = resolver?.(resolverCtx) ?? intersectionResolver(resolverCtx);

  if (parentSchema.description !== undefined && resolved.type) {
    resolved = {
      ...resolved,
      type: resolved.type.mergeConstraints($$.constraints().description(parentSchema.description)),
    };
  }

  const baseClasses: Array<ReturnType<typeof $$.constrainedType>> = [];
  const mergedFields: Array<ReturnType<typeof $$.field>> = [];
  const seenFieldNames = new Set<object>();

  for (const result of childResults) {
    if (isReferenceResult(result)) {
      const t = result.type!;
      if (!baseClasses.includes(t)) baseClasses.push(t);
      continue;
    }

    const finalResult = applyModifiers(result);

    if (finalResult.node?.kind === 'model') {
      for (const field of finalResult.node.fields) {
        if (!seenFieldNames.has(field.name as object)) {
          seenFieldNames.add(field.name as object);
          mergedFields.push(field);
        }
      }
    }
  }

  return {
    ...resolved,
    baseClasses: baseClasses.length ? baseClasses : undefined,
    childResults,
    mergedFields: mergedFields.length ? mergedFields : undefined,
  };
}
