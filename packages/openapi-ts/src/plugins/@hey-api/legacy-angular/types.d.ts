import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'legacy/angular'>,
    Pick<Client.Config, 'output'> {}
