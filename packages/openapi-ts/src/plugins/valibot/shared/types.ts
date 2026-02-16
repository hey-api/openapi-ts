import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { IR, Walker } from '@hey-api/shared';
import type ts from 'typescript';

import type { ValibotPlugin } from '../types';
import type { Pipes } from './pipes';

export type Ast = {
  hasLazyExpression?: boolean;
  pipes: Pipes;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: ValibotPlugin['Instance'];
  /** The plugin state references. */
  state: Refs<PluginState>;
  walk: Walker<ValibotSchemaResult, ValibotPlugin['Instance']>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
};

/**
 * The result from schema walking.
 */
export interface ValibotSchemaResult {
  /** Default value from schema, if any. */
  default?: unknown;
  /** The Valibot pipes AST. */
  expression: { pipes: Pipes };
  /** The original schema format (for BigInt coercion). */
  format?: string;
  /** Whether any child contains a lazy expression. */
  hasLazyExpression?: boolean;
  /** Does this schema explicitly allow null? */
  nullable: boolean;
  /** Is this schema read-only? */
  readonly: boolean;
}

/**
 * The finalized expression after applyModifiers.
 */
export interface ValibotAppliedResult {
  pipes: Pipes;
}
