import { PluginName } from './config';
import { handler } from './plugin.js';
export { defaultConfig, defineConfig } from './config';
export type { Config } from './types';

/**
 * Pinia Colada plugin for generating query and mutation functions
 * that work with @pinia/colada
 */
export default {
  handler,
  name: PluginName,
};
