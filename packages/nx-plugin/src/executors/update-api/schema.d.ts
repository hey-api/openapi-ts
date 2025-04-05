export interface UpdateApiExecutorSchema {
  client: string;
  directory: string;
  name: string;
  plugins: string[];
  scope: string;
  spec: string;
  /**
   * Temporary folder used to store files, only change for testing
   */
  tempFolder?: string;
}
