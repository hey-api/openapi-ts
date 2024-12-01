import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'fastify'> {
  /**
   * Name of the generated file.
   * @default 'fastify'
   */
  output?: string;
}
