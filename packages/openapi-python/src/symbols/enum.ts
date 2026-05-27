import type { PluginInstance } from '@hey-api/shared';

export function ENUM(plugin: PluginInstance) {
  return {
    Enum: plugin.symbol('Enum', { external: 'enum' }),
  };
}
