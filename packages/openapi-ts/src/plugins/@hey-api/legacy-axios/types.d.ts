import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'legacy/axios'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyAxiosPlugin = Plugin.Types<Config>;
