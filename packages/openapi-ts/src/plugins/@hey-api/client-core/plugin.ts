import { clientId } from '../client-core/utils';
import { createClient } from './client';
import { createClientConfigType } from './createClientConfig';
import type { PluginHandler } from './types';

export const clientPluginHandler = ({
  plugin,
}: Parameters<PluginHandler>[0]) => {
  plugin.createFile({
    id: clientId,
    path: plugin.output,
  });

  createClientConfigType({
    plugin: plugin as any,
  });
  createClient({
    plugin: plugin as any,
  });
};
