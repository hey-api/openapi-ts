import type { IR } from '@hey-api/shared';

import type { ValibotResult } from './types';

export function hasIntersectionDiscriminatorBranches({
  items,
  parentSchema,
  schemas,
}: {
  items: ReadonlyArray<ValibotResult>;
  parentSchema: IR.SchemaObject;
  schemas: ReadonlyArray<IR.SchemaObject>;
}): boolean {
  const discriminatorKey = parentSchema.discriminator?.propertyName;
  if (!discriminatorKey) return false;

  for (let index = 0; index < schemas.length; index++) {
    const schema = schemas[index]!;

    if (schema.type === 'null' || schema.const === null) continue;

    if (schema.logicalOperator !== 'and' || !schema.items || schema.items.length !== 2) {
      continue;
    }

    const item = items[index]!;
    const discriminatedValue = schema.items[0]!.properties?.[discriminatorKey]?.const;

    // Treat lazy refs and structural discriminator+ref intersections as incompatible with variant.
    if (item.meta.hasLazy || discriminatedValue !== undefined) {
      return true;
    }
  }

  return false;
}
