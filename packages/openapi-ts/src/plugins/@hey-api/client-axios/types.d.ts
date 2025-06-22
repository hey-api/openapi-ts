import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'@hey-api/client-axios'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientAxiosPlugin = Plugin.Types<Config>;
