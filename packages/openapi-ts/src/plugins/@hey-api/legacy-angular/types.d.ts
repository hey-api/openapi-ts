import type { Client } from '~/plugins/@hey-api/client-core/types';
import type { DefinePlugin, Plugin } from '~/plugins/types';

export type UserConfig = Plugin.Name<'legacy/angular'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyAngularPlugin = DefinePlugin<UserConfig>;
