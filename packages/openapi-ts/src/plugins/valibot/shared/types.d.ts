import type { SymbolMeta } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { ToRefs } from '~/plugins';
import type { $ } from '~/ts-dsl';

import type { ValibotPlugin } from '../types';

export type Ast = {
  hasLazyExpression?: boolean;
  pipes: Array<ReturnType<typeof $.call | typeof $.expr>>;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ValibotPlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
};
