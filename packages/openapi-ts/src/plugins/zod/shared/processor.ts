import type { NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { ZodPlugin } from '../types';
import type { TypeOptions, ZodFinal } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig & TypeOptions;
  /** The plugin instance. */
  plugin: ZodPlugin['Instance'];
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => ZodFinal | void;
};
