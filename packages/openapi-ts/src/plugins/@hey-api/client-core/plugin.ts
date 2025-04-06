import { clientId } from '../client-core/utils';
import { createClient } from './client';
import { createClientConfigType } from './createClientConfig';
import type { PluginHandler } from './types';

export const clientPluginHandler: PluginHandler = ({ context, plugin }) => {
  context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: clientId,
    path: plugin.output,
  });

  createClientConfigType({ context, plugin });
  createClient({ context, plugin });
};
