import {
  type Client,
  clientDefaultConfig,
  clientDefaultMeta,
  clientPluginHandler,
  type DefinePlugin,
  definePluginConfig,
} from '@hey-api/openapi-ts';

export type Config = Client.Config & {
  /**
   * Plugin name. Must be unique.
   */
  name: '@hey-api/custom-client';
};

export type CustomClientPlugin = DefinePlugin<Config, Config>;

export const defaultConfig: CustomClientPlugin['Config'] = {
  ...clientDefaultMeta,
  config: {
    ...clientDefaultConfig,
    bundle: false,
  },
  handler: clientPluginHandler as unknown as CustomClientPlugin['Handler'],
  name: '@hey-api/custom-client',
};

/**
 * Type helper for `@hey-api/custom-client` plugin, returns {@link Plugin.Config} object
 */
export const customClientPlugin = definePluginConfig(defaultConfig);
