import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'legacy/fetch'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyFetchPlugin = Plugin.Types<Config>;
