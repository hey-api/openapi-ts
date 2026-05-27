import type { PluginInstance } from '@hey-api/shared';

export function TYPING(plugin: PluginInstance) {
  return {
    Any: plugin.symbol('Any', { external: 'typing' }),
    Literal: plugin.symbol('Literal', { external: 'typing' }),
    NoReturn: plugin.symbol('NoReturn', { external: 'typing' }),
    Optional: plugin.symbol('Optional', { external: 'typing' }),
    Tuple: plugin.symbol('Tuple', { external: 'typing' }),
    TypeAlias: plugin.symbol('TypeAlias', { external: 'typing' }),
    Union: plugin.symbol('Union', { external: 'typing' }),
  };
}
