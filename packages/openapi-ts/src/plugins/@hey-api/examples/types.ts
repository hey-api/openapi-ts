import type { Casing } from '@hey-api/shared';
import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'@hey-api/examples'> &
  // Plugin.Hooks &
  Plugin.UserExports & {
    // Resolvers & {
    /**
     * Casing convention for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
  };

export type Config = Plugin.Name<'@hey-api/examples'> &
  // Plugin.Hooks &
  Plugin.Exports & {
    // Resolvers & {
    /** Casing convention for generated names. */
    case: Casing;
  };

export type HeyApiExamplesPlugin = DefinePlugin<UserConfig, Config>;
