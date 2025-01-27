import type { Plugin } from '../../types';
import type { Config as ClientAxiosConfig } from '../client-axios';
import type { Config as ClientFetchConfig } from '../client-fetch';
import type { Config as ClientNuxtConfig } from '../client-nuxt';

export type PluginHandler = Plugin.Handler<
  ClientAxiosConfig | ClientFetchConfig | ClientNuxtConfig
>;

export type PluginInstance = Plugin.Instance<
  ClientAxiosConfig | ClientFetchConfig | ClientNuxtConfig
>;
