import { createClient } from '@hey-api/openapi-ts';

export function heyApiPlugin(options?: {
  /**
   * `@hey-api/openapi-ts` configuration options.
   */
  config?: Parameters<typeof createClient>[0];
}) {
  return {
    // TODO: rename to vite-plugin if we end up using `configResolved`
    configResolved: async () => {
      await createClient(options?.config);
    },
    enforce: 'pre',
    name: 'hey-api-plugin',
  };
}
