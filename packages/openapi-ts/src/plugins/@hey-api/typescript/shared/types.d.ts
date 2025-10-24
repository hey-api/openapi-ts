import type { ToRefs } from '~/plugins';

import type { HeyApiTypeScriptPlugin } from '../types';

export type IrSchemaToAstOptions = {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = {
  /**
   * Path to the schema in the intermediary representation.
   */
  path: ReadonlyArray<string | number>;
};
