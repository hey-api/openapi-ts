import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { Client } from '../client-core/types';

export type UserConfig = Plugin.Name<'@hey-api/client-nuxt'> & Client.Config;

export type HeyApiClientNuxtPlugin = DefinePlugin<UserConfig, UserConfig>;
