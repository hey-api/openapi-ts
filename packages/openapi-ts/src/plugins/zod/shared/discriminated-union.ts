import type { Symbol, SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ZodPlugin } from '../types';
import type { Chain } from './chain';
import type { ZodMeta, ZodResult } from './types';

export interface DiscriminatedUnionMember {
  discriminatedValue: unknown;
  refExpression: Chain;
}

export interface DiscriminatedUnionData {
  discriminatorKey: string;
  members: Array<DiscriminatedUnionMember>;
}

export function tryBuildDiscriminatedUnion({
  items,
  parentSchema,
  plugin,
  schemas,
}: {
  items: ReadonlyArray<ZodResult>;
  parentSchema: IR.SchemaObject;
  plugin: ZodPlugin['Instance'];
  schemas: ReadonlyArray<IR.SchemaObject>;
}): DiscriminatedUnionData | null {
  const discriminatorKey = parentSchema.discriminator?.propertyName;
  if (!discriminatorKey) return null;

  const members: Array<DiscriminatedUnionMember> = [];

  for (let index = 0; index < schemas.length; index++) {
    const schema = schemas[index]!;

    if (schema.type === 'null' || schema.const === null) continue;

    if (schema.logicalOperator !== 'and' || !schema.items || schema.items.length !== 2) return null;

    const refPart = schema.items[1]!;
    const discriminatorProp = schema.items[0]!.properties?.[discriminatorKey];
    let discriminatedValue: unknown;
    if (discriminatorProp?.const !== undefined) {
      // Single const value — the common case: { type: "cat" }
      discriminatedValue = discriminatorProp.const;
    } else if (
      discriminatorProp?.logicalOperator === 'or' &&
      discriminatorProp.items?.length &&
      discriminatorProp.items.every((item) => item.const !== undefined)
    ) {
      // OR-of-consts — the discriminator maps multiple values to one schema.
      // Every item must have a const; a future IR change that violates this would
      // silently fall through to `discriminatedValue === undefined` below, which
      // degrades the output from z.discriminatedUnion to a plain z.union.
      discriminatedValue = discriminatorProp.items.map((item) => item.const);
    }

    // lazy references can't be used in a discriminated union directly
    if (discriminatedValue === undefined || items[index]!.meta.hasLazy) return null;

    let refExpression: Chain;
    if (refPart.symbolRef) {
      if ((refPart.symbolRef.meta as unknown as ZodMeta)?.isIntersection) return null;
      refExpression = $(refPart.symbolRef);
    } else if (refPart.$ref) {
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: refPart.$ref,
        tool: 'zod',
      };
      if ((plugin.querySymbol(query)?.meta as unknown as ZodMeta)?.isIntersection) return null;
      refExpression = $(plugin.referenceSymbol(query));
    } else {
      return null;
    }

    members.push({
      discriminatedValue,
      refExpression,
    });
  }

  if (!members.length) return null;

  return {
    discriminatorKey,
    members,
  };
}

/**
 * Builds the Zod AST node for a discriminator branch value.
 *
 * Zod's discriminatedUnion requires each branch discriminator to be a type that
 * getDiscriminator can extract a value set from (ZodLiteral, ZodEnum, or in v4+
 * ZodUnion of literals). The shape to emit depends on the value:
 *
 *   "cat"       → z.literal("cat")
 *   ["x"]       → z.literal("x")         single-element: literal is more ergonomic
 *   ["a", "b"]  → z.enum(["a", "b"])     all strings: enum is more ergonomic than union
 *   [1, 2]      → z.union([z.literal(1), z.literal(2)])
 */
export function buildDiscriminatorExpression(z: Symbol, value: unknown): Chain {
  if (!Array.isArray(value)) {
    return $(z).attr(identifiers.literal).call($.fromValue(value));
  }

  // Single-element array: prefer z.literal over a single-item enum/union
  if (value.length === 1) {
    return $(z).attr(identifiers.literal).call($.fromValue(value[0]));
  }

  if (value.length > 0 && value.every((v) => typeof v === 'string')) {
    return $(z).attr(identifiers.enum).call($.fromValue(value));
  }

  return $(z)
    .attr(identifiers.union)
    .call($.array(...value.map((v) => $(z).attr(identifiers.literal).call($.fromValue(v)))));
}
