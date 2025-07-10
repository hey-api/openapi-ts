import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type UserConfig = Plugin.Name<'legacy/fetch'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyFetchPlugin = DefinePlugin<UserConfig>;
