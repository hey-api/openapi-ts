import type { Plugin } from '../../types';
import type { Client } from '../client-core/types';

export interface Config
  extends Plugin.Name<'legacy/fetch'>,
    Pick<Client.Config, 'output'> {}
