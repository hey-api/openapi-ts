import type { IR } from '@hey-api/shared';

import type { ZodMeta, ZodResult } from './types';

/**
 * Creates default metadata from a schema.
 */
export function defaultMeta(schema: IR.SchemaObject): ZodMeta {
  return {
    default: schema.default,
    format: schema.format,
    hasLazy: false,
    isIntersection: false,
    isLazy: false,
    isObject: false,
    nullable: false,
    readonly: schema.accessScope === 'read',
  };
}

/**
 * Composes metadata from child results.
 *
 * @param children - Results from walking child schemas
 * @param overrides - Explicit overrides (e.g., from parent schema)
 */
export function composeMeta(
  children: ReadonlyArray<ZodResult>,
  overrides?: Partial<ZodMeta>,
): ZodMeta {
  return {
    default: overrides?.default,
    format: overrides?.format,
    hasLazy: overrides?.hasLazy ?? children.some((c) => c.meta.hasLazy),
    isIntersection: overrides?.isIntersection ?? false,
    isLazy: overrides?.isLazy ?? children.some((c) => c.meta.isLazy),
    isObject: overrides?.isObject ?? children.some((c) => c.meta.isObject),
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
export function inheritMeta(parent: IR.SchemaObject, children: ReadonlyArray<ZodResult>): ZodMeta {
  return composeMeta(children, {
    default: parent.default,
    format: parent.format,
    nullable: false,
    readonly: parent.accessScope === 'read',
  });
}
