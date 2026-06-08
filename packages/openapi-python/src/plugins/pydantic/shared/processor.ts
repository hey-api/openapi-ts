import type { NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { PydanticPlugin } from '../types';
import type { PydanticNode } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: PydanticPlugin['Instance'];
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => PydanticNode | void;
};
