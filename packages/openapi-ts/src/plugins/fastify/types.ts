import type { DefinePlugin, Plugin } from '@hey-api/shared';

export type UserConfig = Plugin.Name<'fastify'> & Plugin.Hooks & Plugin.UserExports;

export type FastifyPlugin = DefinePlugin<UserConfig, UserConfig>;
