// import type { IR } from '../../ir/types';
import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'zod'> {
  /**
   * Zod options for the generated schema about datetimes.
   * https://zod.dev/?id=datetimes
   */
  dateTimeOptions?: {
    local?: boolean;
    offset?: boolean;
    precision?: number;
  };
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Customise the Zod schema name. By default, `z{{name}}` is used,
   * where `name` is a definition name or an operation name.
   */
// nameBuilder?: (model: IR.OperationObject | IR.SchemaObject) => string;
/**
   * Name of the generated file.
   *
   * @default 'zod'
   */
  output?: string;
}
