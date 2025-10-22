import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import type { ArktypePlugin } from '../types';

export type Ast = {
  def: string;
  expression: ts.Expression;
  hasCircularReference?: boolean;
  typeName?: string | ts.Identifier;
};

export type IrSchemaToAstOptions = {
  plugin: ArktypePlugin['Instance'];
  state: State;
};

export type State = {
  /**
   * Path to the schema in the intermediary representation.
   */
  _path: ReadonlyArray<string | number>;
  circularReferenceTracker: Array<string>;
  /**
   * Works the same as `circularReferenceTracker`, but it resets whenever we
   * walk inside another schema. This can be used to detect if a schema
   * directly references itself.
   */
  currentReferenceTracker: Array<string>;
  hasCircularReference: boolean;
};

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ArktypePlugin['Instance'];
};
