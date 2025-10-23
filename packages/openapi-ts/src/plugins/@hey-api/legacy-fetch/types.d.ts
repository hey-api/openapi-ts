import type { Client } from '~/plugins/@hey-api/client-core/types';
import type { DefinePlugin, Plugin } from '~/plugins/types';

export type UserConfig = Plugin.Name<'legacy/fetch'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyFetchPlugin = DefinePlugin<UserConfig>;
