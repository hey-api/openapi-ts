import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'openapi-info'> {
  /**
   * Name of the generated file.
   *
   * @default 'openapi-info'
   */
  output?: string;
}
