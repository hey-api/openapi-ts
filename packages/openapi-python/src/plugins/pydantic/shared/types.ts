import type { Refs, Symbol, SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaExtractor } from '@hey-api/shared';

import type { $, MaybePyDsl } from '../../../py-dsl';
import type { py } from '../../../ts-python';
import type { PydanticPlugin } from '../types';
import type { ProcessorContext } from './processor';

export type Ast = {
  /**
   * Field constraints for pydantic.Field()
   */
  fieldConstraints?: Record<string, unknown>;
  /**
   * Whether this AST node has a lazy expression (forward reference)
   */
  hasLazyExpression?: boolean;
  models: Array<{
    baseName: string;
    expression: ReturnType<typeof $.class>;
    symbol: Symbol;
  }>;
  /**
   * Type annotation for the field
   */
  typeAnnotation: string;
  /**
   * Type name for the model class
   */
  typeName?: string;
};

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: PydanticPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
  /** The plugin state references. */
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

/**
 * Pipe system for building field constraints (similar to Valibot pattern)
 */
export type Pipes = Array<unknown>;

/**
 * Context for type resolver functions
 */
export interface ResolverContext {
  /**
   * Field constraints being built
   */
  constraints: Record<string, unknown>;
  /**
   * The plugin instance
   */
  plugin: PydanticPlugin['Instance'];
  /**
   * IR schema being processed
   */
  schema: IR.SchemaObject;
}

// ..... ^^^^^^ OLD

/**
 * Metadata that flows through schema walking.
 */
export interface PydanticMeta {
  /** Default value from schema. */
  default?: unknown;
  /** Original format (for BigInt coercion). */
  format?: string;
  /** Whether this or any child contains a lazy reference. */
  hasLazy: boolean;
  /** Does this schema explicitly allow null? */
  nullable: boolean;
  /** Is this schema read-only? */
  readonly: boolean;
}

/**
 * Result from walking a schema node.
 */
export interface PydanticResult {
  fieldConstraints: Record<string, unknown>;
  fields?: Array<PydanticField>;
  meta: PydanticMeta;
  typeAnnotation: string | MaybePyDsl<py.Expression>;
}

export interface PydanticField {
  fieldConstraints: Record<string, unknown>;
  isOptional: boolean;
  name: string;
  typeAnnotation: string | MaybePyDsl<py.Expression>;
}

/**
 * Finalized result after applyModifiers.
 */
export interface PydanticFinal {
  fieldConstraints: Record<string, unknown>;
  fields?: Array<PydanticField>; // present = emit class, absent = emit type alias
  typeAnnotation: string | MaybePyDsl<py.Expression>;
}

/**
 * Result from composite handlers that walk children.
 */
export interface PydanticCompositeHandlerResult {
  childResults: Array<PydanticResult>;
  fieldConstraints: Record<string, unknown>;
  typeAnnotation: string | MaybePyDsl<py.Expression>;
}
