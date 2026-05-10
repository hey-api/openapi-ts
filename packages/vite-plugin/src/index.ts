// @ts-ignore
import { createClient } from '@hey-api/openapi-ts';
// @ts-ignore
import type { Plugin } from 'vite';

// @ts-ignore
type OpenApiConfig = Parameters<typeof createClient>[0];

export interface HeyApiPluginOptions {
  config?: OpenApiConfig;
  vite?: Omit<Plugin, 'configResolved' | 'name'>;
}

export function heyApiPlugin(options?: HeyApiPluginOptions): Plugin {
  let pluginConfig = options?.config;

  return {
    enforce: 'pre',
    ...options?.vite,
    async configResolved() {
      if (!pluginConfig) {
        try {
          const openApiTs = await import('@hey-api/openapi-ts');

          // @ts-ignore
          if (typeof openApiTs.getConfig === 'function') {
            // @ts-ignore
            pluginConfig = await openApiTs.getConfig();
          }
        } catch {
          console.warn(
            '[@hey-api/vite-plugin] No configuration provided and default config file not found.',
          );
        }
      }

      if (pluginConfig) {
        // @ts-ignore
        await createClient(pluginConfig);
      }
    },
    name: 'hey-api-plugin',
  } as Plugin;
}
