import type { SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import type { ZodPlugin } from '../types';
import type { ZodMeta, ZodResult } from './types';

function isRecordShaped(schema: IR.SchemaObject | undefined): boolean {
  if (!schema || schema.type !== 'object') return false;
  const hasProperties = schema.properties && Object.keys(schema.properties).length > 0;
  return !hasProperties && Boolean(schema.additionalProperties);
}

export function shouldFallBackToUnion({
  childResults,
  parentSchema,
  plugin,
  schemas,
}: {
  childResults: ReadonlyArray<ZodResult>;
  parentSchema: IR.SchemaObject;
  plugin: ZodPlugin['Instance'];
  schemas: ReadonlyArray<IR.SchemaObject>;
}): boolean {
  if (!parentSchema.discriminator) return false;

  for (let index = 0; index < schemas.length; index++) {
    const schema = schemas[index]!;
    if (schema.type === 'null' || schema.const === null) continue;

    const ref = schema.$ref;
    if (!ref) continue;

    let resolved: IR.SchemaObject | undefined;
    try {
      resolved = plugin.context.resolveIrRef<IR.SchemaObject>(ref);
    } catch {
      continue;
    }

    const query: SymbolMeta = {
      category: 'schema',
      resource: 'definition',
      resourceId: ref,
      tool: 'zod',
    };
    if ((plugin.querySymbol(query)?.meta as unknown as ZodMeta)?.isIntersection) {
      if (!(resolved?.logicalOperator === 'and' && resolved.items?.length === 1)) {
        return true;
      }
    }

    if (isRecordShaped(resolved)) return true;

    if (childResults[index]!.meta.hasLazy) return true;
  }

  return false;
}
