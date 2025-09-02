import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';
import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@hey-api/client-angular'> &
  Client.Config & {
    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientAngularPlugin = DefinePlugin<
  UserConfig,
  UserConfig,
  IApi
>;
