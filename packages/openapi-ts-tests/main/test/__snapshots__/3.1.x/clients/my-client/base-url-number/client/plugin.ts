import {
  type Client,
  clientDefaultConfig,
  clientDefaultMeta,
  clientPluginHandler,
  type DefinePlugin,
  definePluginConfig,
} from '@hey-api/openapi-ts';

export type IApi = any;

export class Api implements IApi {}

export type Config = Client.Config & {
  /**
   * Plugin name. Must be unique.
   */
  name: string;
};

export type MyClientPlugin = DefinePlugin<Config, Config, IApi>;

export const defaultConfig: MyClientPlugin['Config'] = {
  ...clientDefaultMeta,
  api: new Api(),
  config: clientDefaultConfig,
  handler: clientPluginHandler,
  name: __filename,
};

/**
 * Type helper for `my-client` plugin, returns {@link Plugin.Config} object
 */
export const myClientPlugin = definePluginConfig(defaultConfig);
