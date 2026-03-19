import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'nestjs'> & Plugin.Hooks & Plugin.UserExports;

export type NestJsPlugin = DefinePlugin<UserConfig, UserConfig>;
