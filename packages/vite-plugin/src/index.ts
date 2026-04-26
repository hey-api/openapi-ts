import { createClient } from '@hey-api/openapi-ts';
import type { Plugin } from 'vite';

export interface HeyApiPluginOptions {
  /**
   * `@hey-api/openapi-ts` configuration options.
   */
  config?: Parameters<typeof createClient>[0];
  /**
   * Vite plugin API options.
   */
  vite?: Omit<Plugin, 'configResolved' | 'name'>;
}

export function heyApiPlugin(options?: HeyApiPluginOptions): Plugin {
  return {
    enforce: 'pre',
    ...options?.vite,
    async configResolved() {
      await createClient(options?.config);
    },
    name: 'hey-api-plugin',
  };
}
