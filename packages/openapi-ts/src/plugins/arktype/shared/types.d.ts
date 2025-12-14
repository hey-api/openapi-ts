import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { $ } from '~/ts-dsl';

import type { ArktypePlugin } from '../types';

export type Ast = {
  def: string;
  expression: ReturnType<typeof $.call | typeof $.expr | typeof $.object>;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ArktypePlugin['Instance'];
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
