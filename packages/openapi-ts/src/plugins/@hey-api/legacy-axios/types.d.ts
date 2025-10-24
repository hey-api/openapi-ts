import type { DefinePlugin, Plugin } from '~/plugins';
import type { Client } from '~/plugins/@hey-api/client-core/types';

export type UserConfig = Plugin.Name<'legacy/axios'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyAxiosPlugin = DefinePlugin<UserConfig>;
