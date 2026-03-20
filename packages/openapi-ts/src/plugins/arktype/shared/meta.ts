import type { IR } from '@hey-api/shared';
import type { ArktypeMeta } from './types';

import { maybeBigInt } from '../../../plugins/shared/utils/coerce';
import type { ArktypePlugin } from '../types';
import { $ } from '../../../ts-dsl';

/**
 * Create baseline metadata from a leaf schema.
 */
export function defaultMeta(schema: IR.SchemaObject): ArktypeMeta {
  return {
    default: schema.default,
    format: schema.format,
    hasLazy: false,
    nullable: false,
    readonly: schema.accessScope === 'read',
    hasCircular: false,
  };
}

/**
 * Compose metadata from child results (for union/intersection).
 */
export function composeMeta(
  children: Array<ArktypeMeta>,
  overrides?: Partial<ArktypeMeta>
): ArktypeMeta {
  // For union/intersection:
  // - hasLazy: true if any child has lazy
  // - nullable: true if any child is nullable
  // - readonly: true if any child is readonly
  // - hasCircular: true if any child has circular reference
  // default/format: not used for composites
  
  const hasLazy = children.some(child => child.hasLazy);
  const nullable = children.some(child => child.nullable);
  const readonly = children.some(child => child.readonly);
  const hasCircular = children.some(child => child.hasCircular);
  
  return {
    default: undefined,
    format: undefined,
    hasLazy,
    nullable,
    readonly,
    hasCircular,
    ...overrides,
  };
}

/**
 * Inherit metadata from parent schema combined with composed children.
 */
export function inheritMeta(
  parent: IR.SchemaObject,
  children: Array<ArktypeMeta>
): ArktypeMeta {
  // For array/object/tuple:
  // - default: from parent (if present)
  // - format: from parent (if present)
  // - hasLazy: true if any child has lazy
  // - nullable: false (parent controls nullability)
  // - readonly: from parent (if read-only) OR if any child readonly
  // - hasCircular: true if any child has circular reference
  
  const childHasLazy = children.some(child => child.hasLazy);
  const childHasCircular = children.some(child => child.hasCircular);
  const childReadonly = children.some(child => child.readonly);
  
  return {
    default: parent.default,
    format: parent.format,
    hasLazy: childHasLazy,
    nullable: false, // Parent controls nullability for composites
    readonly: parent.accessScope === 'read' || childReadonly,
    hasCircular: childHasCircular,
  };
}

/**
 * Get the default value AST node, handling BigInt coercion.
 */
export function getDefaultValue(
  meta: ArktypeMeta
): ReturnType<typeof $.fromValue> {
  return meta.format ? maybeBigInt(meta.default, meta.format) : $.fromValue(meta.default);
}