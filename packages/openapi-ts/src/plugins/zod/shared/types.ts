import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { FeatureToggle, IR, NamingOptions, Walker } from '@hey-api/shared';
import type ts from 'typescript';

import type { $ } from '../../../ts-dsl';
import type { ZodPlugin } from '../types';

export type Ast = {
  anyType?: string;
  expression: ReturnType<typeof $.expr | typeof $.call>;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: ZodPlugin['Instance'];
  /** The plugin state references. */
  state: Refs<PluginState>;
  walk: Walker<ZodSchemaResult, ZodPlugin['Instance']>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    anyType?: string;
    hasLazyExpression: boolean;
  };

export type TypeOptions = {
  /** Configuration for TypeScript type generation from Zod schemas. */
  types: {
    /** Configuration for `infer` types. */
    infer: NamingOptions & FeatureToggle;
  };
};

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
};

/**
 * The result from schema walking.
 */
export interface ZodSchemaResult {
  /** Default value from schema, if any. */
  default?: unknown;
  /** The Zod expression AST. */
  expression: { expression: ReturnType<typeof $.expr | typeof $.call> };
  /** The original schema format (for BigInt coercion). */
  format?: string;
  /** Whether any child contains a lazy expression. */
  hasLazyExpression?: boolean;
  /** Whether THIS result is itself lazy (not just inherited). */
  isLazy?: boolean;
  /** Does this schema explicitly allow null? */
  nullable: boolean;
  /** Is this schema read-only? */
  readonly: boolean;
}

/**
 * The finalized expression after applyModifiers.
 */
export interface ZodAppliedResult {
  expression: ReturnType<typeof $.expr | typeof $.call>;
}
