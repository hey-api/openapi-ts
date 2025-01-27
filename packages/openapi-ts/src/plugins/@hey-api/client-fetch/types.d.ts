import type { Client, Plugin } from '../../types';

export interface Config
  extends Plugin.Name<'@hey-api/client-fetch'>,
    Client.Config {
  /**
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: boolean;
}
