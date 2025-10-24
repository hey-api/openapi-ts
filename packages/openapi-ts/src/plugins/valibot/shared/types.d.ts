import type { IR } from '~/ir/types';
import type { ToRefs } from '~/plugins/shared/types/refs';
import type { StringCase, StringName } from '~/types/case';

import type { ValibotPlugin } from '../types';

export type IrSchemaToAstOptions = {
  plugin: ValibotPlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = {
  hasLazyExpression: boolean;
  nameCase: StringCase;
  nameTransformer: StringName;
  /**
   * Path to the schema in the intermediary representation.
   */
  path: ReadonlyArray<string | number>;
};

export type ValidatorArgs = {
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
};
