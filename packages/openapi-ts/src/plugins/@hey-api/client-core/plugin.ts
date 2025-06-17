import { clientId } from '../client-core/utils';
import { createClient } from './client';
import { createClientConfigType } from './createClientConfig';
import type { PluginHandler } from './types';

export const clientPluginHandler: PluginHandler = ({ plugin }) => {
  plugin.createFile({
    id: clientId,
    path: plugin.output,
  });

  createClientConfigType({ plugin });
  createClient({ plugin });
};
