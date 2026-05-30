import type { SymbolIn } from '@hey-api/codegen-core';

import type { GetNameContext } from '../parser/hooks';
import { applyNaming } from '../utils/naming/naming';
import type { PluginInstance } from './shared/utils/instance';

/**
 * Helper function to build the input for symbol registration, applying naming hooks if provided.
 */
export function buildSymbolIn({
  plugin,
  ...ctx
}: GetNameContext & {
  plugin: {
    config: Pick<PluginInstance['config'], '~hooks'>;
    context: {
      config: {
        parser: Pick<PluginInstance['context']['config']['parser'], 'hooks'>;
      };
    };
    getHooks: PluginInstance['getHooks'];
  };
}): SymbolIn {
  const hooks = plugin.getHooks((hooks) => hooks.symbols?.getName);
  for (const hook of hooks) {
    const result = hook(ctx);
    if (typeof result === 'function') {
      const name = result(ctx);
      if (name) {
        return {
          meta: ctx.meta,
          name,
        };
      }
    } else if (typeof result === 'string') {
      return {
        meta: ctx.meta,
        name: ctx.naming ? applyNaming(result, ctx.naming) : result,
      };
    }
  }

  return {
    meta: ctx.meta,
    name: ctx.naming ? applyNaming(ctx.name, ctx.naming) : ctx.name,
  };
}
