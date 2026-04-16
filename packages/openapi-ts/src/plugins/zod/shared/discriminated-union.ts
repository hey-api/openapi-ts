import type { SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaVisitorContext } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ZodPlugin } from '../types';
import type { Chain } from './chain';
import type { ZodResult } from './types';

/**
 * Attempts to build a `z.discriminatedUnion()` expression when the parent
 * schema carries a discriminator and all non-null union items follow the
 * expected intersection pattern `{ discrimObject, ref }`.
 *
 * Returns the expression on success, or `null` to fall back to `z.union()`.
 */
export function tryBuildDiscriminatedUnion({
  ctx,
  items,
  parentSchema,
  schemas,
  z,
}: {
  ctx: SchemaVisitorContext<ZodPlugin['Instance']>;
  items: ReadonlyArray<ZodResult>;
  parentSchema: IR.SchemaObject;
  schemas: ReadonlyArray<IR.SchemaObject>;
  z: ReturnType<typeof ctx.plugin.external>;
}): Chain | null {
  if (!parentSchema.discriminator) {
    return null;
  }

  const discriminatorKey = parentSchema.discriminator.propertyName;

  const unionMembers: Array<Chain> = [];

  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i]!;

    // Skip null types - handled separately by the null/nullable modifiers
    if (schema.type === 'null' || schema.const === null) {
      continue;
    }

    // Each non-null item must be an intersection (`and`) of exactly 2 parts:
    // [0] discriminator-object, [1] schema reference
    if (schema.logicalOperator !== 'and' || !schema.items || schema.items.length !== 2) {
      return null;
    }

    const discrimPart = schema.items[0]!;
    const refPart = schema.items[1]!;

    // Discriminator part must be an object with a single const property
    const discrimValue = discrimPart.properties?.[discriminatorKey]?.const;
    if (discrimValue === undefined || discrimPart.type !== 'object') {
      return null;
    }

    // Ref part must be a named schema reference (not an inline or lazy schema)
    if (!refPart.$ref && !refPart.symbolRef) {
      return null;
    }

    // Lazy references can't be used in a discriminated union directly
    if (items[i]!.meta.hasLazy) {
      return null;
    }

    // Build the reference expression
    let refExpression: Chain;
    if (refPart.symbolRef) {
      refExpression = $(refPart.symbolRef);
    } else {
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: refPart.$ref!,
        tool: 'zod',
      };
      refExpression = $(ctx.plugin.referenceSymbol(query));
    }

    // Build: `zRef.extend({ [discriminatorKey]: z.literal(value) })`
    unionMembers.push(
      refExpression
        .attr(identifiers.extend)
        .call(
          $.object().prop(
            discriminatorKey,
            $(z).attr(identifiers.literal).call($.fromValue(discrimValue)),
          ),
        ),
    );
  }

  if (!unionMembers.length) {
    return null;
  }

  return $(z)
    .attr(identifiers.discriminatedUnion)
    .call(
      $.literal(discriminatorKey),
      $.array()
        .pretty()
        .elements(...unionMembers),
    );
}
