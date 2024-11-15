import type { PluginName } from '../types';

export interface Config extends PluginName<'fastify'> {
  // TODO: parser - rename operationId option to something like inferId?: boolean
  /**
   * Use operation ID to generate operation names?
   * @default true
   */
  operationId?: boolean;
  /**
   * Name of the generated file.
   * @default 'fastify'
   */
  output?: string;
}
