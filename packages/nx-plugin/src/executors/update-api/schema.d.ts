import type { Plugin } from '../../utils';

export interface UpdateApiExecutorSchema {
  client: string;
  directory: string;
  /**
   * If true, the Client code will be regenerated even if the spec has not changed
   */
  force?: boolean;
  name: string;
  plugins: Plugin[];
  scope: string;
  spec: string;
  /**
   * Temporary folder used to store files, only change for testing
   */
  tempFolder?: string;
}
