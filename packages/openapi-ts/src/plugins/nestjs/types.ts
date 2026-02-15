import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'nestjs'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Group controller methods by OpenAPI tag.
     * When true, generates per-tag types like `PetsControllerMethods`.
     * When false (default), generates flat `ControllerMethods`.
     *
     * @default false
     */
    groupByTag?: boolean;
  };

export type Config = Plugin.Name<'nestjs'> &
  Plugin.Hooks &
  Plugin.Exports & {
    groupByTag: boolean;
  };

export type NestJSPlugin = DefinePlugin<UserConfig, Config>;
