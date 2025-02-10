import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'fastify'> {
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'fastify'
   */
  output?: string;
}
