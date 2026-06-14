import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { FastifySymbols } from './symbols';

export type UserConfig = Plugin.Name<'fastify'> & Plugin.Hooks & Plugin.UserExports;

export type FastifyPlugin = DefinePlugin<UserConfig, UserConfig, never, FastifySymbols>;
