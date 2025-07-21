import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type UserConfig = Plugin.Name<'@hey-api/client-nuxt'> & Client.Config;

export type HeyApiClientNuxtPlugin = DefinePlugin<UserConfig>;
