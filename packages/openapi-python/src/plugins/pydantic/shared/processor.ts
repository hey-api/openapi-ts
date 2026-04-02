import type { NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { PydanticPlugin } from '../types';
import type { PydanticFinal } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: PydanticPlugin['Instance'];
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => PydanticFinal | void;
};
