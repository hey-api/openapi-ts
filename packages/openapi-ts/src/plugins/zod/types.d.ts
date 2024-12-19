// import type { IR } from '../../ir/types';
import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'zod'> {
  /**
   * Customise the Zod schema name. By default, `z{{name}}` is used,
   * where `name` is a definition name or an operation name.
   */
  // nameBuilder?: (model: IR.OperationObject | IR.SchemaObject) => string;
  /**
   * Name of the generated file.
   * @default 'zod'
   */
  output?: string;
}
