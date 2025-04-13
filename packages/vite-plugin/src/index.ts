import { createClient } from '@hey-api/openapi-ts';

export function heyApiPlugin(options?: {
  /**
   * `@hey-api/openapi-ts` configuration options.
   */
  config?: Parameters<typeof createClient>[0];
}) {
  return {
    configResolved: async () => {
      await createClient(options?.config);
    },
    enforce: 'pre',
    name: 'hey-api-plugin',
  };
}
