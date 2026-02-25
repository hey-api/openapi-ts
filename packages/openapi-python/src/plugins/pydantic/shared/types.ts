import type { Symbol } from '@hey-api/codegen-core';

import type { AnnotationExpr } from '../../../py-dsl';

/**
 * Return type for toType converters.
 */
export interface PydanticType {
  fieldConstraints?: Record<string, unknown>;
  typeAnnotation?: AnnotationExpr;
}

/**
 * Metadata that flows through schema walking.
 */
export interface PydanticMeta {
  /** Default value from schema. */
  default?: unknown;
  /** Whether this or any child contains a forward reference. */
  hasForwardReference: boolean;
  /** Does this schema explicitly allow null? */
  nullable: boolean;
  /** Is this schema read-only? */
  readonly: boolean;
}

/**
 * Result from walking a schema node.
 */
export interface PydanticResult extends PydanticType {
  enumMembers?: Array<{ name: Symbol; value: string | number }>;
  fields?: Array<PydanticField>; // present = emit class, absent = emit type alias
  meta: PydanticMeta;
}

export interface PydanticField extends PydanticType {
  isOptional: boolean;
  name: Symbol;
  originalName?: string;
}

/**
 * Finalized result after applyModifiers.
 */
export interface PydanticFinal
  extends PydanticType, Pick<PydanticResult, 'enumMembers' | 'fields'> {}
