import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'@hey-api/client-nuxt'> & Client.Config;

export type HeyApiClientNuxtPlugin = Plugin.Types<Config>;
