import type { IR, NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { ArktypePlugin } from '../types';
import type { ArktypeFinal } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: ArktypePlugin['Instance'];
  schema: IR.SchemaObject;
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => ArktypeFinal | void;
};