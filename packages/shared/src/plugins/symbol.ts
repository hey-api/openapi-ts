import type { SymbolIn } from '@hey-api/codegen-core';

import type { GetNameContext } from '../parser/hooks';
import { applyNaming } from '../utils/naming/naming';
import type { PluginInstance } from './shared/utils/instance';

/**
 * Function to build the input for symbol registration, applying naming hooks if provided.
 */
export function buildSymbolIn({
  plugin,
  ...ctx
}: GetNameContext & {
  plugin: {
    getHooks: PluginInstance['getHooks'];
  };
}): SymbolIn {
  const priority = defaultPriorityFromPath(ctx.path);
  const hooks = plugin.getHooks((hooks) => hooks.symbols?.getName);
  for (const hook of hooks) {
    const result = hook(ctx);
    if (typeof result === 'function') {
      const name = result(ctx);
      if (name) {
        return {
          meta: ctx.meta,
          name,
          priority,
        };
      }
    } else if (typeof result === 'string') {
      return {
        meta: ctx.meta,
        name: ctx.naming ? applyNaming(result, ctx.naming) : result,
        priority,
      };
    }
  }

  return {
    meta: ctx.meta,
    name: ctx.naming ? applyNaming(ctx.name, ctx.naming) : ctx.name,
    priority,
  };
}

const MAX_PRIORITY_FROM_PATH = 100;

/**
 * Derives naming priority from path depth.
 */
function defaultPriorityFromPath(path?: ReadonlyArray<string | number>): number | undefined {
  if (!path?.length) return;
  return Math.max(0, MAX_PRIORITY_FROM_PATH - path.length);
}
