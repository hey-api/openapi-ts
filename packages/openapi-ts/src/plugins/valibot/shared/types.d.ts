import type { IR } from '../../../ir/types';
import type { StringCase, StringName } from '../../../types/case';
import type { ValibotPlugin } from '../types';

export type IrSchemaToAstOptions = {
  plugin: ValibotPlugin['Instance'];
  state: State;
};

export type State = {
  /**
   * Path to the schema in the intermediary representation.
   */
  _path: ReadonlyArray<string | number>;
  circularReferenceTracker: Set<string>;
  hasCircularReference: boolean;
  nameCase: StringCase;
  nameTransformer: StringName;
};

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
};
