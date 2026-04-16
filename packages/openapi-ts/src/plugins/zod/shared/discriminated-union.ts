import type { SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaVisitorContext } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ZodPlugin } from '../types';
import type { Chain } from './chain';
import type { ZodResult } from './types';

/**
 * Attempts to build a `z.discriminatedUnion()` expression when the parent
 * schema carries a `discriminator` set by the IR parser. Each non-null union
 * item is expected to follow the pattern
 * `{ logicalOperator: 'and', items: [discrimObj, ref] }`
 * produced by the OpenAPI discriminator parser.
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
  const discriminatorKey = parentSchema.discriminator?.propertyName;
  if (!discriminatorKey) {
    return null;
  }

  const unionMembers: Array<Chain> = [];

  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i]!;

    if (schema.type === 'null' || schema.const === null) {
      continue;
    }

    if (schema.logicalOperator !== 'and' || !schema.items || schema.items.length !== 2) {
      return null;
    }

    const refPart = schema.items[1]!;
    const discrimValue = schema.items[0]!.properties?.[discriminatorKey]?.const;

    if (discrimValue === undefined) {
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
    } else if (refPart.$ref) {
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: refPart.$ref,
        tool: 'zod',
      };
      refExpression = $(ctx.plugin.referenceSymbol(query));
    } else {
      return null;
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
