import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';

import type { ValibotPlugin } from '../types';
import type { Pipes } from './pipes';

export type Ast = {
  hasLazyExpression?: boolean;
  pipes: Pipes;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ValibotPlugin['Instance'];
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
