import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'legacy/fetch'>,
    Pick<Client.Config, 'output'> {}
