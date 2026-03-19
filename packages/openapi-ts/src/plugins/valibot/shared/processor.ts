import type { IR, NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { ValibotPlugin } from '../types';
import type { ValibotFinal } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: ValibotPlugin['Instance'];
  schema: IR.SchemaObject;
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => ValibotFinal | void;
};
