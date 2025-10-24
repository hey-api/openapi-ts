import type { SymbolMeta } from '@hey-api/codegen-core';

import type { ToRefs } from '~/plugins';

import type { HeyApiTypeScriptPlugin } from '../types';

export type IrSchemaToAstOptions = {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: ToRefs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'>;
