import type { PluginInstance } from '@hey-api/shared';

export function FUNC_TOOLS(plugin: PluginInstance) {
  return {
    cachedProperty: plugin.symbol('cached_property', {
      external: 'functools',
    }),
  };
}
