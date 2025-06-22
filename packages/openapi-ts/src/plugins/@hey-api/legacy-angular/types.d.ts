import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'legacy/angular'> &
  Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyAngularPlugin = Plugin.Types<Config>;
