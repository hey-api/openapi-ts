import type { IR } from '@hey-api/shared';

import type { PydanticMeta, PydanticResult } from './types';

/**
 * Creates default metadata from a schema.
 */
export function defaultMeta(schema: IR.SchemaObject): PydanticMeta {
  return {
    default: schema.default,
    hasForwardReference: false,
    nullable: false,
    readonly: schema.accessScope === 'read',
  };
}

/**
 * Composes metadata from child results.
 *
 * Automatically propagates hasForwardReference, nullable, readonly from children.
 *
 * @param children - Results from walking child schemas
 * @param overrides - Explicit overrides (e.g., from parent schema)
 */
export function composeMeta(
  children: ReadonlyArray<PydanticResult>,
  overrides?: Partial<PydanticMeta>,
): PydanticMeta {
  return {
    default: overrides?.default,
    hasForwardReference:
      overrides?.hasForwardReference ?? children.some((c) => c.meta.hasForwardReference),
    nullable: overrides?.nullable ?? children.some((c) => c.meta.nullable),
    readonly: overrides?.readonly ?? children.some((c) => c.meta.readonly),
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
  children: ReadonlyArray<PydanticResult>,
): PydanticMeta {
  return composeMeta(children, {
    default: parent.default,
    nullable: false,
    readonly: parent.accessScope === 'read',
  });
}
