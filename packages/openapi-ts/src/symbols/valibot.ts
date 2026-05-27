import type { PluginInstance } from '@hey-api/shared';

export function VALIBOT(plugin: PluginInstance) {
  return {
    v: plugin.symbol('v', {
      external: 'valibot',
      importKind: 'namespace',
    }),
  };
}
