import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'@hey-api/client-nuxt'>,
    Client.Config {}
