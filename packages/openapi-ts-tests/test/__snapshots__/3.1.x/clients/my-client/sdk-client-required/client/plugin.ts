import {
  type Client,
  clientDefaultConfig,
  clientDefaultMeta,
  clientPluginHandler,
  definePluginConfig,
  type Plugin,
} from '@hey-api/openapi-ts';

type Config = Client.Config & {
  /**
   * Plugin name. Must be unique.
   */
  name: string;
}

export type MyClientPlugin = Plugin.Types<Config>;

export const defaultConfig: Plugin.Config<MyClientPlugin> = {
  ...clientDefaultMeta,
  config: clientDefaultConfig,
  handler: clientPluginHandler as Plugin.Handler<MyClientPlugin>,
  name: __filename,
};

/**
 * Type helper for `my-client` plugin, returns {@link Plugin.Config} object
 */
export const myClientPlugin = definePluginConfig(defaultConfig);
