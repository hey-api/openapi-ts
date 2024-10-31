import type { DefineConfig, PluginConfig } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: PluginConfig<Config> = {
  _handler: handler,
  _handlerLegacy: () => {},
  name: 'fastify',
  output: 'fastify',
};

/**
 * Type helper for the Fastify plugin, returns {@link PluginConfig} object
 */
export const defineConfig: DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
