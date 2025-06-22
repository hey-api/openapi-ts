import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'@hey-api/client-next'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientNextPlugin = Plugin.Types<Config>;
