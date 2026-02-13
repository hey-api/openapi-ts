import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaExtractor } from '@hey-api/shared';
import type ts from 'typescript';

import type { ValibotPlugin } from '../types';
import type { Pipes } from './pipes';
import type { ProcessorContext } from './processor';

export type Ast = {
  hasLazyExpression?: boolean;
  pipes: Pipes;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: ValibotPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
  /** The plugin state references. */
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
};
