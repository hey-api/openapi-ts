import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import type ts from 'typescript';

import type { $ } from '../../../ts-dsl';
import type { ZodPlugin } from '../types';

export type Ast = {
  expression: ReturnType<typeof $.expr | typeof $.call>;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ZodPlugin['Instance'];
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
};
