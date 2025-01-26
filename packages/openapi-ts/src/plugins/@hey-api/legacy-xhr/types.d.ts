import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'legacy/xhr'>,
    Pick<Client.Config, 'output'> {}
