import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type UserConfig = Plugin.Name<'@hey-api/client-fetch'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientFetchPlugin = DefinePlugin<UserConfig>;
