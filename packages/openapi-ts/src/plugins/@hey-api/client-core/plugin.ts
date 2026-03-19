import { createClient } from './client';
import { createClientConfigType } from './createClientConfig';
import type { PluginHandler } from './types';

export const clientPluginHandler = ({ plugin }: Parameters<PluginHandler>[0]) => {
  createClientConfigType({ plugin });
  createClient({ plugin });
};
