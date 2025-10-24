import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { ToRefs } from '~/plugins';

import type { ArktypePlugin } from '../types';

export type Ast = {
  def: string;
  expression: ts.Expression;
  hasLazyExpression?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ArktypePlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = {
  /**
   * Path to the schema in the intermediary representation.
   */
  _path: ReadonlyArray<string | number>;
  hasLazyExpression: boolean;
};

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ArktypePlugin['Instance'];
};
