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
  name: string;
};

export type MyClientPlugin = DefinePlugin<Config, Config>;

export const defaultConfig: MyClientPlugin['Config'] = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler: clientPluginHandler as MyClientPlugin['Handler'],
  name: import.meta.filename,
};

/**
 * Type helper for `my-client` plugin, returns {@link Plugin.Config} object
 */
export const myClientPlugin = definePluginConfig(defaultConfig);
