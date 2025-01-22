import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'msw'> {
  /**
   * Name of the generated file.
   *
   * @default 'msw'
   */
  output?: string;
}
