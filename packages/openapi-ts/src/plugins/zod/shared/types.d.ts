import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { ToRefs } from '~/plugins/shared/types/refs';

import type { ZodPlugin } from '../types';

export type Ast = {
  expression: ts.Expression;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ZodPlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = {
  hasLazyExpression: boolean;
  /**
   * Path to the schema in the intermediary representation.
   */
  path: ReadonlyArray<string | number>;
};

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
};
