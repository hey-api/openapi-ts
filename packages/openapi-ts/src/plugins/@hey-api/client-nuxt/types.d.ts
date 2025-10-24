import type { DefinePlugin, Plugin } from '~/plugins';
import type { Client } from '~/plugins/@hey-api/client-core/types';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@hey-api/client-nuxt'> & Client.Config;

export type HeyApiClientNuxtPlugin = DefinePlugin<UserConfig, UserConfig, IApi>;
