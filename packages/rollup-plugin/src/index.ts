import { createClient, type UserConfig } from '@hey-api/openapi-ts';

export function heyApiPlugin(options?: {
  /**
   * `@hey-api/openapi-ts` configuration options.
   */
  config?: UserConfig;
}) {
  return {
    buildStart: async () => {
      // @ts-expect-error
      await createClient(options?.config ?? {});
    },
    name: 'hey-api-plugin',
  };
}
