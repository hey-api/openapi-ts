import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'msw'> &
  Plugin.Hooks &
  Plugin.UserExports & {
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
    /** Sources for default parameter values in handler factories. */
    valueSources: ReadonlyArray<'example'>;
  };

export type MswPlugin = DefinePlugin<UserConfig, Config>;
