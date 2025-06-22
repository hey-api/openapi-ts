import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'legacy/xhr'> & Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyXhrPlugin = Plugin.Types<Config>;
