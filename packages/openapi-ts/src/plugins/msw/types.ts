import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'msw'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Set a default base URL when creating the handlers? You can set `baseUrl`
     * to a string which will be used as the base URL. If your input defines
     * server(s), you can set `baseUrl` to a number to pick a specific server
     * to use as the base URL. You can disable setting the base URL by setting
     * `baseUrl` to `false`. By default, `baseUrl` is `'*'`, which matches all
     * URLs.
     *
     * If the matched URL contains template literals, it will be ignored.
     *
     * @default '*'
     */
    baseUrl?: string | number | boolean;
    /**
     * Sources for default parameter values in handler factories. Order determines
     * priority (earlier entries take precedence).
     *
     * - `'example'` - use OpenAPI example values
     *
     * @default ['example']
     */
    valueSources?: ReadonlyArray<'example'>;
  };

export type Config = Plugin.Name<'msw'> &
  Plugin.Hooks &
  Plugin.Exports & {
    /** Set a default base URL when creating the handlers. */
    baseUrl: string | number | boolean;
    /** Sources for default parameter values in handler factories. */
    valueSources: ReadonlyArray<'example'>;
  };

export type MswPlugin = DefinePlugin<UserConfig, Config>;
