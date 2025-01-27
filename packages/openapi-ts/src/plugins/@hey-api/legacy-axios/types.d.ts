import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'legacy/axios'>,
    Pick<Client.Config, 'output'> {}
