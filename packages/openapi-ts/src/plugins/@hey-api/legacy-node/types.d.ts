import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';

export type Config = Plugin.Name<'legacy/node'> & Pick<Client.Config, 'output'>;

export type HeyApiClientLegacyNodePlugin = DefinePlugin<Config>;
