import type { IR } from '@hey-api/shared';

import type { TypeScriptMeta, TypeScriptResult } from './types';

/**
 * Creates default metadata from a schema.
 */
export function defaultMeta(schema: IR.SchemaObject): TypeScriptMeta {
  return {
    default: schema.default,
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
  children: ReadonlyArray<TypeScriptResult>,
  overrides?: Partial<TypeScriptMeta>,
): TypeScriptMeta {
  return {
    default: overrides?.default,
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
  children: ReadonlyArray<TypeScriptResult>,
): TypeScriptMeta {
  return composeMeta(children, {
    default: parent.default,
    readonly: parent.accessScope === 'read',
  });
}
