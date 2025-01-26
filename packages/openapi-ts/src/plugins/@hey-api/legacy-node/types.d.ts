import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'legacy/node'>,
    Pick<Client.Config, 'output'> {}
