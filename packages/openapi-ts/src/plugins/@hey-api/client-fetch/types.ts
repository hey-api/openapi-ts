import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { Client } from '../../../plugins/@hey-api/client-core/types';

export type UserConfig = Plugin.Name<'@hey-api/client-fetch'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
    /**
     * Error shape to throw when `throwOnError` is enabled. By default, the
     * parsed backend error body is thrown to preserve legacy behavior.
     *
     * @default 'body'
     */
    throwOnErrorStyle?: 'body' | 'wrapper';
  };

export type HeyApiClientFetchPlugin = DefinePlugin<UserConfig, UserConfig>;
