import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'msw'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Sources for inferring default parameter values in generated handler
     * factories. Order determines priority (earlier entries take precedence).
     *
     * - `'example'` - use OpenAPI example values
     *
     * @default ['example']
     */
    valueSources?: ReadonlyArray<'example'>;
  };

export type Config = UserConfig;

export type MswPlugin = DefinePlugin<UserConfig, Config>;
