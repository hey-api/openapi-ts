import type { NodeName, Symbol } from '@hey-api/codegen-core';

import type { py } from '../../../py-compiler';
import type { MaybePyDsl, VarType } from '../../../py-dsl';
import type { PydanticEnumDsl, PydanticModelDsl, PydTypeAliasPyDsl } from '../dsl';
import type { FieldConstraints } from '../v2/constants';

/**
 * Return type for toType converters.
 */
export interface PydanticType {
  fieldConstraints?: FieldConstraints;
  type?: NodeName | MaybePyDsl<py.Expression>;
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
  /** @deprecated Migrate to {@link PydanticNode}. */
  dsl?: PydanticModelDsl | PydanticEnumDsl | PydTypeAliasPyDsl;
  /** @deprecated Migrate to {@link PydanticNode}. */
  enumMembers?: Array<{ name: Symbol; value: string | number }>;
  /** @deprecated Migrate to {@link PydanticNode}. */
  fields?: Array<PydanticField>; // present = emit class, absent = emit type alias
  meta: PydanticMeta;
}

export interface PydanticField extends PydanticType {
  /**
   * Wire name. Only present when it differs from the Python identifier.
   * @see {@link PydanticFieldSpec.alias}
   */
  alias?: string;
  /**
   * Default value for this field.
   * - `undefined`: required, no default.
   * - `null`: optional, defaults to Python `None`.
   * - Any other value: explicit default.
   *
   * Independent of {@link nullable} — a nullable field may still be required.
   */
  default?: unknown;
  /**
   * @deprecated Use `default !== undefined` to determine optionality.
   * Use `nullable` for Optional wrapping.
   */
  isOptional: boolean;
  name: Symbol;
  /**
   * Whether the field type is wrapped with `Optional[...]`.
   * Independent of whether the field is required.
   */
  nullable?: boolean;
  /** @deprecated Use {@link alias}. */
  originalName?: string;
}

/**
 * @deprecated Use {@link PydanticNode} instead.
 */
export interface PydanticFinal
  extends PydanticType, Pick<PydanticResult, 'dsl' | 'enumMembers' | 'fields'> {}

export interface PydanticFieldSpec {
  /** Wire name. Only present when it differs from {@link pythonName}. */
  alias?: string;
  /** Validation constraints. `default` is tracked separately on {@link default}. */
  constraints?: FieldConstraints;
  /**
   * Default value for this field.
   * - `undefined`: required.
   * - `null`: optional, defaults to Python `None`.
   * - Any other value: explicit default.
   *
   * Independent of {@link nullable}.
   */
  default?: unknown;
  /**
   * Whether the field type should be wrapped with `Optional[...]`.
   * Independent of whether the field is required.
   */
  nullable: boolean;
  /** Python identifier (snake_case). */
  pythonName: string;
  /** Resolved base type, without `Optional` wrapping. Applied at render time. */
  type: VarType;
}

/**
 * Discriminated union of all finalized schema outputs.
 * Replaces {@link PydanticFinal}.
 */
export type PydanticNode =
  | { kind: 'alias'; type: VarType }
  | { kind: 'enum'; members: Array<{ name: Symbol; value: string | number }> }
  | { fields: Array<PydanticFieldSpec>; kind: 'model' };
