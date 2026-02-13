import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import type { SchemaExtractor } from '@hey-api/shared';

import type { HeyApiTypeScriptPlugin } from '../types';

export type IrSchemaToAstOptions = {
  /** The plugin instance. */
  plugin: HeyApiTypeScriptPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor;
  /** The plugin state references. */
  state: Refs<PluginState>;
};

export type PluginState = Pick<Required<SymbolMeta>, 'path'> & Pick<Partial<SymbolMeta>, 'tags'>;
