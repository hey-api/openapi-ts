import type { SymbolMeta } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { ToRefs } from '~/plugins';
import type { $ } from '~/ts-dsl';

import type { ZodPlugin } from '../types';

export type Ast = {
  expression: ReturnType<typeof $.expr | typeof $.call>;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ZodPlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'> & {
    hasLazyExpression: boolean;
  };

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
};
