import type { PluginHandler } from '../types';
import type { PluginConfig } from './types';

export const handler: PluginHandler<PluginConfig> = ({ plugin }) => {
  console.warn(plugin);
};
