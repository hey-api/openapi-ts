import type { PluginInstance } from '@hey-api/shared';

export function AXIOS(plugin: PluginInstance) {
  return {
    AxiosError: plugin.symbol('AxiosError', {
      external: 'axios',
      kind: 'type',
    }),
  };
}
