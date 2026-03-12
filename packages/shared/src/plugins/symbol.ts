import type { SymbolIn, SymbolMeta } from '@hey-api/codegen-core';

import type { IROperationObject, IRSchemaObject } from '../ir/types';
import type { PluginInstance } from './shared/utils/instance';

/**
 * Helper function to build the input for symbol registration, applying naming hooks if provided.
 */
export function buildSymbolIn(ctx: {
  meta: SymbolMeta;
  name: string;
  operation?: IROperationObject;
  plugin: {
    config: Pick<PluginInstance['config'], '~hooks'>;
  };
  schema?: IRSchemaObject;
}): SymbolIn {
  const getName = ctx.plugin.config['~hooks']?.symbols?.getName ?? (() => {});
  return {
    meta: ctx.meta,
    name: getName(ctx) ?? ctx.name,
  };
}
