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
  };
}): SymbolIn {
  const hooks = [
    plugin.config['~hooks']?.symbols?.getName,
    plugin.context.config.parser.hooks.symbols?.getName,
  ];
  for (const hook of hooks) {
    if (!hook) continue;

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

  // When casing is 'preserve' and the symbol is for an operation with an original
  // operationId, use the original operationId to preserve acronym casing.
  // Check both `casing` (preferred) and `case` (deprecated) to handle all config forms.
  const casing = ctx.naming?.casing ?? ctx.naming?.case;
  const name =
    casing === 'preserve' && ctx.operation?.operationId ? ctx.operation.operationId : ctx.name;

  return {
    meta: ctx.meta,
    name: ctx.naming ? applyNaming(name, ctx.naming) : name,
  };
}
