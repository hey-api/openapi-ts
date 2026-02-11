import type { Refs, Symbol, SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import type { $ } from '../../../py-dsl';
import type { PydanticPlugin } from '../types';

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
  plugin: PydanticPlugin['Instance'];
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
