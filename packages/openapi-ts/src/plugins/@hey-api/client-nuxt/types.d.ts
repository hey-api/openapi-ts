import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';
import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@hey-api/client-nuxt'> & Client.Config;

export type HeyApiClientNuxtPlugin = DefinePlugin<UserConfig, UserConfig, IApi>;
