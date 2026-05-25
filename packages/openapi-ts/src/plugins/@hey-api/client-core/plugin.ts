import { createClient } from './client';
import { createClientConfigType } from './createClientConfig';
import type { PluginHandler } from './types';

export function clientPluginHandler({ plugin }: Parameters<PluginHandler>[0]): void {
  createClientConfigType({ plugin });
  createClient({ plugin });
}
