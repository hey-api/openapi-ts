import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import type { PydanticPlugin } from '../types';

/**
 * Shared types for Pydantic plugin
 */

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

/**
 * AST node representation for Pydantic models
 */
export interface Ast {
  /**
   * Expression node for the type
   */
  expression: unknown;
  /**
   * Field constraints for pydantic.Field()
   */
  fieldConstraints?: Record<string, unknown>;
  /**
   * Whether this AST node has a lazy expression (forward reference)
   */
  hasLazyExpression?: boolean;
  /**
   * Pipes/chains for building the field definition (similar to Valibot pipes)
   */
  pipes?: Pipes;
  /**
   * Type annotation for the field
   */
  typeAnnotation: string;
  /**
   * Type name for the model class
   */
  typeName?: string;
}

/**
 * Pipe system for building field constraints (similar to Valibot pattern)
 */
export type Pipes = Array<unknown>;

/**
 * Options for converting IR schema to AST
 */
export interface IrSchemaToAstOptions {
  /**
   * The plugin instance
   */
  plugin: PydanticPlugin['Instance'];
  /**
   * Current plugin state
   */
  state: Refs<PluginState>;
}

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
