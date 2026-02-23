import type { IR } from '@hey-api/shared';

import type { ValibotMeta, ValibotResult } from './types';

/**
 * Creates default metadata from a schema.
 */
export function defaultMeta(schema: IR.SchemaObject): ValibotMeta {
  return {
    default: schema.default,
    format: schema.format,
    hasLazy: false,
    nullable: false,
    readonly: schema.accessScope === 'read',
  };
}

/**
 * Composes metadata from child results.
 *
 * Automatically propagates hasLazy, nullable, readonly from children.
 *
 * @param children - Results from walking child schemas
 * @param overrides - Explicit overrides (e.g., from parent schema)
 */
export function composeMeta(
  children: ReadonlyArray<ValibotResult>,
  overrides?: Partial<ValibotMeta>,
): ValibotMeta {
  const hasLazy = overrides?.hasLazy ?? children.some((c) => c.meta.hasLazy);
  const nullable = overrides?.nullable ?? children.some((c) => c.meta.nullable);
  const readonly = overrides?.readonly ?? children.some((c) => c.meta.readonly);

  return {
    default: overrides?.default,
    format: overrides?.format,
    hasLazy,
    nullable,
    readonly,
  };
}

/**
 * Merges parent schema metadata with composed child metadata.
 *
 * @param parent - The parent schema
 * @param children - Results from walking child schemas
 */
export function inheritMeta(
  parent: IR.SchemaObject,
  children: ReadonlyArray<ValibotResult>,
): ValibotMeta {
  return composeMeta(children, {
    default: parent.default,
    format: parent.format,
    nullable: false,
    readonly: parent.accessScope === 'read',
  });
}
