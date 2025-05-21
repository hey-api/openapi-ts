// import type { IR } from '../../ir/types';
import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'valibot'> {
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Customise the Valibot schema name. By default, `v{{name}}` is used,
   * where `name` is a definition name or an operation name.
   */
  // nameBuilder?: (model: IR.OperationObject | IR.SchemaObject) => string;
  /**
   * Name of the generated file.
   *
   * @default 'valibot'
   */
  output?: string;
}
