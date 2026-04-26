import type { SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
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
    const discriminatedValue = schema.items[0]!.properties?.[discriminatorKey]?.const;

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
