import type { PluginInstance } from '@hey-api/shared';

export function ANGULAR(plugin: PluginInstance) {
  return {
    Injectable: plugin.symbol('Injectable', {
      external: '@angular/core',
    }),
  };
}
