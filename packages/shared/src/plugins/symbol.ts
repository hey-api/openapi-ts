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
          priority: defaultPriorityFromPath(ctx.path),
        };
      }
    } else if (typeof result === 'string') {
      return {
        meta: ctx.meta,
        name: ctx.naming ? applyNaming(result, ctx.naming) : result,
        priority: defaultPriorityFromPath(ctx.path),
      };
    }
  }

  return {
    meta: ctx.meta,
    name: ctx.naming ? applyNaming(ctx.name, ctx.naming) : ctx.name,
    priority: defaultPriorityFromPath(ctx.path),
  };
}

/**
 * Derives naming priority from path depth.
 */
function defaultPriorityFromPath(path?: ReadonlyArray<string | number>): number | undefined {
  if (!path?.length) return;
  return Math.max(0, 100 - path.length);
}
