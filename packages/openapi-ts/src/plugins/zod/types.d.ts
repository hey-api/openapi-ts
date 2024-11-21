// import type { IROperationObject, IRSchemaObject } from '../../ir/ir';
import type { PluginName } from '../types';

export interface Config extends PluginName<'zod'> {
  /**
   * Customise the Zod schema name. By default, `z{{name}}` is used,
   * where `name` is a definition name or an operation name.
   */
  // nameBuilder?: (model: IROperationObject | IRSchemaObject) => string;
  /**
   * Name of the generated file.
   * @default 'zod'
   */
  output?: string;
}
