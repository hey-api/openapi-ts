import type { Client } from '~/plugins/@hey-api/client-core/types';
import type { DefinePlugin, Plugin } from '~/plugins/types';

export type UserConfig = Plugin.Name<'legacy/xhr'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyXhrPlugin = DefinePlugin<UserConfig>;
