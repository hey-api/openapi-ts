import type { Refs, SymbolMeta } from '@hey-api/codegen-core';

import type { HeyApiTypeScriptPlugin } from '../types';

export type IrSchemaToAstOptions = {
  optional?: boolean;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> &
  Pick<Partial<SymbolMeta>, 'tags'>;
