import type { DefinePlugin, Plugin } from '~/plugins';
import type { Client } from '~/plugins/@hey-api/client-core/types';

export type UserConfig = Plugin.Name<'legacy/xhr'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyXhrPlugin = DefinePlugin<UserConfig>;
