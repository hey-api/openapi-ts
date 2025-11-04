import type { DefinePlugin, Plugin } from '~/plugins';
import type { Client } from '~/plugins/@hey-api/client-core/types';

export type UserConfig = Plugin.Name<'@hey-api/client-ofetch'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientOfetchPlugin = DefinePlugin<UserConfig, UserConfig>;
