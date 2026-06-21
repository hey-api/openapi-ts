import type { IR, NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { FakerJsFakerPlugin } from '../types';
import type { FakerResult } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: FakerJsFakerPlugin['Instance'];
  schema: IR.SchemaObject;
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => FakerResult | void;
};
