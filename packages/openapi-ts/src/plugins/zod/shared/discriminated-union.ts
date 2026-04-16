import type { SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaVisitorContext } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ZodPlugin } from '../types';
import type { Chain } from './chain';
import type { ZodResult } from './types';

/**
 * Returns the discriminator key if all non-null items in the union follow the
 * pattern produced by the OpenAPI discriminator parser:
 *   `{ logicalOperator: 'and', items: [discrimObj, ref] }`
 * where `discrimObj` is an object with exactly one const-valued property.
 *
 * Returns `null` when the pattern is not recognised.
 */
function detectDiscriminatorKey(schemas: ReadonlyArray<IR.SchemaObject>): string | null {
  let key: string | undefined;

  for (const schema of schemas) {
    if (schema.type === 'null' || schema.const === null) {
      continue;
    }

    if (schema.logicalOperator !== 'and' || !schema.items || schema.items.length !== 2) {
      return null;
    }

    const discrimPart = schema.items[0]!;

    if (discrimPart.type !== 'object' || !discrimPart.properties) {
      return null;
    }

    const props = Object.entries(discrimPart.properties);
    if (props.length !== 1 || props[0]![1].const === undefined) {
      return null;
    }

    const propKey = props[0]![0];

    if (key === undefined) {
      key = propKey;
    } else if (key !== propKey) {
      // All items must share the same discriminator key
      return null;
    }
  }

  return key ?? null;
}

/**
 * Attempts to build a `z.discriminatedUnion()` expression when all non-null
 * union items follow the discriminator intersection pattern
 * `{ discrimObject, ref }` produced by the OpenAPI discriminator parser.
 *
 * Returns the expression on success, or `null` to fall back to `z.union()`.
 */
export function tryBuildDiscriminatedUnion({
  ctx,
  items,
  schemas,
  z,
}: {
  ctx: SchemaVisitorContext<ZodPlugin['Instance']>;
  items: ReadonlyArray<ZodResult>;
  schemas: ReadonlyArray<IR.SchemaObject>;
  z: ReturnType<typeof ctx.plugin.external>;
}): Chain | null {
  const discriminatorKey = detectDiscriminatorKey(schemas);
  if (!discriminatorKey) {
    return null;
  }

  const unionMembers: Array<Chain> = [];

  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i]!;

    if (schema.type === 'null' || schema.const === null) {
      continue;
    }

    const refPart = schema.items![1]!;
    const discrimValue = schema.items![0]!.properties![discriminatorKey]!.const;

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
