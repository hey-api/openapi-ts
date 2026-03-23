import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaExtractor } from '@hey-api/shared';
import type ts from 'typescript';

import type { $ } from '../../../ts-dsl';
import type { ArktypePlugin } from '../types';

/**
 * Metadata flowing through schema walking.
 */
export type ArktypeMeta = {
  /** Default value from schema (undefined if none) */
  default?: unknown;
  /** Original format (for BigInt coercion) */
  format?: string;
  /** Whether this or any child contains a lazy reference */
  hasLazy: boolean;
  /** Does schema allow null */
  nullable: boolean;
  /** Is schema read-only */
  readonly: boolean;
  /** Does this schema have a circular reference */
  hasCircular: boolean;
};

/**
 * Result from walking a schema node (pre-modifier application).
 */
export type ArktypeResult = {
  /** Metadata for this schema node */
  meta: ArktypeMeta;
  /** Optional string definition (when expressible as Arktype string syntax) */
  def?: string;
  /** AST expression representing the type */
  expression: ReturnType<typeof $.call | typeof $.expr | typeof $.object>;
};

/**
 * Finalized result after applying modifiers (optional/nullable/default/readonly).
 */
export type ArktypeFinal = {
  /** Pipes/validation chain after modifier application */
  expression: ReturnType<typeof $.call | typeof $.expr | typeof $.object>;
  /** Optional type annotation for circular references */
  typeName?: string | ts.Identifier;
};

/**
 * Result for composite types (union/intersection) that have already-walked children.
 */
export type CompositeHandlerResult = {
  /** Already-processed child results */
  childResults: Array<ArktypeResult>;
  /** Combined expression for the composite */
  expression: ReturnType<typeof $.call | typeof $.expr | typeof $.object>;
};

/**
 * Options passed to schema walking functions.
 */
export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: ArktypePlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor;
  /** The plugin state references. */
  state: Refs<PluginState>;
};

/**
 * Plugin state tracking.
 */
export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    /** Tracks if any lazy references were encountered */
    hasLazyExpression: boolean;
  };

/**
 * Arguments passed to validator factory functions.
 */
export type ValidatorArgs = {
  /** The operation being validated */
  operation: IR.OperationObject;
  /** The plugin instance */
  plugin: ArktypePlugin['Instance'];
};