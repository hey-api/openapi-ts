import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { IR, SchemaExtractor } from '@hey-api/shared';
import type ts from 'typescript';

import type { $ } from '../../../ts-dsl';
import type { ArktypePlugin } from '../types';

export type Ast = {
  def: string;
  expression: ReturnType<typeof $.call | typeof $.expr | typeof $.object>;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: ArktypePlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor;
  /** The plugin state references. */
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ArktypePlugin['Instance'];
};
