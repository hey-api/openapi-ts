import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { Client } from '~/plugins/@hey-api/client-core/types';

export type UserConfig = Plugin.Name<'@hey-api/client-angular'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientAngularPlugin = DefinePlugin<UserConfig, UserConfig>;
