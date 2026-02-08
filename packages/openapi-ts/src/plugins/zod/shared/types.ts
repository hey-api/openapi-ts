import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { FeatureToggle, IR, NamingOptions, SchemaExtractor } from '@hey-api/shared';
import type ts from 'typescript';

import type { $ } from '../../../ts-dsl';
import type { ZodPlugin } from '../types';
import type { ProcessorContext } from './processor';

export type Ast = {
  expression: ReturnType<typeof $.expr | typeof $.call>;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: ZodPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
  /** The plugin state references. */
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
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
